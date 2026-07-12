import { useEffect, useRef, useState } from "react";
import type { ListeningQuestion as LQ } from "../../services/assessment";
import { cancelSpeech, isTTSSupported, onVoicesReady, speak } from "../../services/tts";

interface Props {
  question: LQ;
  disabled?: boolean;
  onSubmit: (selectedIndex: number) => void;
}

export function ListeningQuestion({ question, disabled, onSubmit }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = isTTSSupported();
  const off = useRef<(() => void) | null>(null);

  useEffect(() => {
    setSelected(null);
    setHasPlayed(false);
    setError(null);
    return () => cancelSpeech();
  }, [question.id]);

  useEffect(() => {
    off.current = onVoicesReady(() => { /* voices now available */ });
    return () => { off.current?.(); cancelSpeech(); };
  }, []);

  const play = () => {
    if (!supported) {
      setError("Audio playback isn't supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    setError(null);
    speak({
      text: question.audioText,
      lang: question.language,
      onStart: () => setPlaying(true),
      onEnd: () => { setPlaying(false); setHasPlayed(true); },
      onError: (msg) => { setPlaying(false); setError(msg); },
    });
  };

  return (
    <div className="q-block">
      <p className="q-instruction">{question.instruction}</p>

      <div className="listening-card">
        <div className="listening-icon" aria-hidden>🎧</div>
        <div className="listening-body">
          <p className="muted" style={{ margin: 0 }}>
            {playing ? "Playing audio…" : hasPlayed ? "Audio played. Replay if you need." : "Press play to hear the clip."}
          </p>
          <div className="listening-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={play}
              disabled={playing || disabled}
            >
              {playing ? "Playing…" : hasPlayed ? "▶ Replay Audio" : "▶ Play Audio"}
            </button>
          </div>
          {error ? <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>{error}</div> : null}
          {!supported ? (
            <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>
              Your browser doesn't support audio playback. Try Chrome, Edge, or Safari.
            </div>
          ) : null}
        </div>
      </div>

      <div role="radiogroup" aria-label="Answer options" className="options-list">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            className={`option${selected === i ? " selected" : ""}`}
            disabled={disabled}
            onClick={() => setSelected(i)}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="quiz-actions">
        <button
          className="btn btn-accent"
          onClick={() => selected != null && onSubmit(selected)}
          disabled={selected == null || disabled}
        >
          Submit Response
        </button>
      </div>
    </div>
  );
}
