import { useEffect, useRef, useState } from "react";
import type { SpeakingQuestion as SQ } from "../../services/assessment";
import { isSTTSupported, requestMicPermission, startRecording, type SpeechRecorder } from "../../services/stt";

interface Props {
  question: SQ;
  disabled?: boolean;
  onSubmit: (payload: { transcript: string; durationMs: number }) => void;
}

type RecState = "idle" | "requesting" | "recording" | "done" | "error";

export function SpeakingQuestion({ question, disabled, onSubmit }: Props) {
  const [state, setState] = useState<RecState>("idle");
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<SpeechRecorder | null>(null);
  const supported = isSTTSupported();

  useEffect(() => {
    setState("idle");
    setTranscript("");
    setDuration(0);
    setError(null);
    return () => { recorderRef.current?.abort(); recorderRef.current = null; };
  }, [question.id]);

  const start = async () => {
    setError(null);
    if (!supported) {
      setState("error");
      setError("Speech recognition isn't supported in this browser. You can skip this question or type your answer instead.");
      return;
    }
    setState("requesting");
    const ok = await requestMicPermission();
    if (!ok) {
      setState("error");
      setError("Microphone permission was denied. Please enable microphone access and try again.");
      return;
    }
    const rec = startRecording({
      lang: question.language,
      onStart: () => setState("recording"),
      onPartial: (t) => setTranscript(t),
      onFinal: (t, ms) => { setTranscript(t); setDuration(ms); setState("done"); },
      onError: (msg) => { setError(msg); setState("error"); },
      onEnd: () => { recorderRef.current = null; },
    });
    recorderRef.current = rec;
    if (!rec) setState("error");
  };

  const stop = () => {
    recorderRef.current?.stop();
  };

  const retry = () => {
    setTranscript("");
    setDuration(0);
    setError(null);
    setState("idle");
  };

  const submit = () => {
    onSubmit({ transcript: transcript.trim(), durationMs: duration });
  };

  return (
    <div className="q-block">
      <p className="q-instruction">{question.instruction}</p>

      <div className="speaking-card">
        <div className="target-phrase">
          <span className="target-label">Say this:</span>
          <p className="target-text">"{question.targetPhrase}"</p>
        </div>

        {!supported ? (
          <div className="alert alert-error">
            Speech recognition isn't supported in this browser. Try Chrome, Edge, or Safari — or submit without a recording to skip.
          </div>
        ) : null}

        <div className={`mic-state mic-${state}`}>
          {state === "recording" ? (
            <>
              <div className="mic-pulse" aria-hidden>🎤</div>
              <p>Listening… speak clearly.</p>
            </>
          ) : state === "requesting" ? (
            <p>Requesting microphone access…</p>
          ) : state === "done" ? (
            <p>✅ Recording finished.</p>
          ) : (
            <p className="muted">Press Start Speaking, read the phrase aloud, then press Stop.</p>
          )}
        </div>

        {transcript ? (
          <div className="transcript-box">
            <div className="stat-label">Recognized transcript</div>
            <p>{transcript}</p>
          </div>
        ) : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="quiz-actions">
          {state === "recording" ? (
            <button className="btn btn-secondary" onClick={stop} disabled={disabled}>
              ■ Stop Speaking
            </button>
          ) : state === "done" || state === "error" ? (
            <>
              <button className="btn btn-secondary" onClick={retry} disabled={disabled}>
                ↻ Retry Speaking
              </button>
              <button className="btn btn-accent" onClick={submit} disabled={disabled}>
                Submit Response
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" onClick={start} disabled={disabled || state === "requesting"}>
                🎤 Start Speaking
              </button>
              <button
                className="btn btn-secondary"
                onClick={submit}
                disabled={disabled}
                title="Skip if you cannot record"
              >
                Skip
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
