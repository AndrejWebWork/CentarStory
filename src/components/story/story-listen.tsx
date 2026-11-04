"use client";

import { useEffect, useRef, useState } from "react";
import { intlTag } from "@/lib/format";
import { bestVoice, loadVoices, tune } from "@/lib/speech/speak";

function piecesOf(script: string) {
  const text = script.replace(/\s*\n+\s*/g, " ").replace(/\s+/g, " ").trim();
  const rough = text
    .split(/(?<=[!?…])\s+|(?<=[0-9A-Za-z\u00C0-\u024F\u0400-\u04FF]{3}[.])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const pieces: string[] = [];
  for (const part of rough) {
    const previous = pieces.at(-1);
    if (previous && previous.length + part.length < 220) {
      pieces[pieces.length - 1] = `${previous} ${part}`;
      continue;
    }
    pieces.push(part);
  }
  return pieces;
}

export function StoryListen({
  title,
  paragraphs,
  locale,
  promptLabel,
  listenLabel,
  stopLabel,
  statusLabel,
  missingLabel,
}: {
  title: string;
  paragraphs: string[];
  locale: string;
  promptLabel: string;
  listenLabel: string;
  stopLabel: string;
  statusLabel: string;
  missingLabel: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [missing, setMissing] = useState(false);
  const stopRef = useRef(false);
  const keepAlive = useRef<number | null>(null);
  const script = [title, ...paragraphs].filter(Boolean).join(". ");

  function clearKeepAlive() {
    if (keepAlive.current !== null) {
      window.clearInterval(keepAlive.current);
      keepAlive.current = null;
    }
  }

  function stop() {
    stopRef.current = true;
    clearKeepAlive();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  useEffect(() => {
    return () => {
      stopRef.current = true;
      clearKeepAlive();
      window.speechSynthesis?.cancel();
    };
  }, [script]);

  async function start() {
    const synth = window.speechSynthesis;
    if (!synth) {
      setMissing(true);
      return;
    }
    stopRef.current = false;
    setMissing(false);
    const pieces = piecesOf(script);
    if (pieces.length === 0) return;
    setSpeaking(true);
    const lang = intlTag(locale);
    const voices = await loadVoices(synth);
    if (stopRef.current) return;
    const voice = bestVoice(voices, lang);
    let index = 0;

    const speakNext = () => {
      if (stopRef.current) return;
      if (index >= pieces.length) {
        clearKeepAlive();
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(pieces[index] ?? "");
      tune(utterance, voice, lang);
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = (event) => {
        if (stopRef.current || event.error === "interrupted" || event.error === "canceled") return;
        index += 1;
        speakNext();
      };
      synth.speak(utterance);
    };

    if (synth.speaking || synth.pending) synth.cancel();
    window.setTimeout(speakNext, synth.speaking || synth.pending ? 60 : 0);
    clearKeepAlive();
    keepAlive.current = window.setInterval(() => {
      if (!stopRef.current && synth.paused) synth.resume();
    }, 10000);
  }

  return (
    <div className="cs-listen">
      <p className="cs-listen-prompt">{promptLabel}</p>
      <button
        type="button"
        onClick={() => (speaking ? stop() : void start())}
        className={speaking ? "cs-tape is-playing" : "cs-tape"}
        aria-pressed={speaking}
        aria-label={speaking ? stopLabel : listenLabel}
      >
        <span className="cs-tape-word">{speaking ? stopLabel : listenLabel}</span>
        <span className="cs-tape-window" aria-hidden="true">
          <span className="cs-tape-film" />
        </span>
        <span className="cs-reel" aria-hidden="true" />
      </button>
      <p className="sr-only" aria-live="polite">
        {missing ? missingLabel : speaking ? statusLabel : ""}
      </p>
      {missing ? <p className="cs-listen-missing">{missingLabel}</p> : null}
    </div>
  );
}
