// Browser Speech-to-Text wrapper using the Web Speech Recognition API.
// Kept isolated from assessment logic. Frontend does NOT score speech.

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> & {
    length: number;
  };
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSTTSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface SpeechRecorder {
  stop: () => void;
  abort: () => void;
}

export interface RecordOptions {
  lang?: string;
  onStart?: () => void;
  onPartial?: (transcript: string) => void;
  onFinal?: (transcript: string, durationMs: number) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}

export async function requestMicPermission(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Immediately stop tracks — we only needed the permission prompt.
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export function startRecording(opts: RecordOptions): SpeechRecorder | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    opts.onError?.("Speech recognition is not supported in this browser.");
    return null;
  }
  const rec = new Ctor();
  rec.lang = opts.lang ?? "en-US";
  rec.continuous = false;
  rec.interimResults = true;

  let finalText = "";
  let startedAt = 0;
  let finished = false;

  rec.onstart = () => {
    startedAt = Date.now();
    opts.onStart?.();
  };
  rec.onresult = (event) => {
    let interim = "";
    for (let i = 0; i < event.results.length; i++) {
      const alt = event.results[i][0];
      if (!alt) continue;
      // Some browsers mark isFinal on the result; treat all as running string.
      interim += alt.transcript;
    }
    finalText = interim.trim();
    opts.onPartial?.(finalText);
  };
  rec.onerror = (e) => {
    finished = true;
    let msg = "Speech recognition error.";
    switch (e.error) {
      case "not-allowed":
      case "service-not-allowed":
        msg = "Microphone permission was denied.";
        break;
      case "no-speech":
        msg = "We didn't hear anything — please try again.";
        break;
      case "audio-capture":
        msg = "No microphone was found.";
        break;
      case "network":
        msg = "Network error during speech recognition.";
        break;
    }
    opts.onError?.(msg);
  };
  rec.onend = () => {
    opts.onEnd?.();
    if (!finished) {
      finished = true;
      opts.onFinal?.(finalText, Date.now() - startedAt);
    }
  };

  try {
    rec.start();
  } catch (err) {
    opts.onError?.((err as Error).message || "Failed to start recording.");
    return null;
  }

  return {
    stop: () => { try { rec.stop(); } catch { /* noop */ } },
    abort: () => { try { rec.abort(); } catch { /* noop */ } },
  };
}
