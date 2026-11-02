"use client";

import { useEffect, useRef, useState } from "react";
import { intlTag } from "@/lib/format";

function piecesOf(script: string) {
  const raw = script
    .split(/\n+|(?<=[.!?;:…])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const pieces: string[] = [];
  for (const part of raw) {
    if (part.length <= 240) {
      pieces.push(part);
      continue;
    }
    for (let index = 0; index < part.length; index += 240) {
      pieces.push(part.slice(index, index + 240).trim());
    }
  }
  return pieces.filter(Boolean);
}

function voiceFor(voices: SpeechSynthesisVoice[], lang: string) {
  const base = lang.slice(0, 2).toLowerCase();
  return voices.find((voice) => voice.lang.toLowerCase().replace("_", "-").startsWith(base));
}

export function StoryListen({
  title,
  paragraphs,
  locale,
  listenLabel,
  stopLabel,
  statusLabel,
  missingLabel,
}: {
  title: string;
  paragraphs: string[];
  locale: string;
  listenLabel: string;
  stopLabel: string;
  statusLabel: string;
  missingLabel: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [missing, setMissing] = useState(false);
  const stopRef = useRef(false);
  const keepAlive = useRef<number | null>(null);
  const script = [title, ...paragraphs].filter(Boolean).join("\n");

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

  function start() {
    const synth = window.speechSynthesis;
    if (!synth) {
      setMissing(true);
      return;
    }
    stopRef.current = false;
    setMissing(false);
    const pieces = piecesOf(script);
    if (pieces.length === 0) return;
    const lang = intlTag(locale);
    const voiceRef = { current: voiceFor(synth.getVoices(), lang) };
    const refreshVoice = () => {
      voiceRef.current = voiceFor(synth.getVoices(), lang);
    };
    synth.addEventListener("voiceschanged", refreshVoice);
    let index = 0;

    const speakNext = () => {
      if (stopRef.current) {
        synth.removeEventListener("voiceschanged", refreshVoice);
        return;
      }
      if (index >= pieces.length) {
        synth.removeEventListener("voiceschanged", refreshVoice);
        clearKeepAlive();
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(pieces[index] ?? "");
      utterance.lang = lang;
      if (voiceRef.current) utterance.voice = voiceRef.current;
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

    setSpeaking(true);
    if (synth.speaking || synth.pending) {
      synth.cancel();
      window.setTimeout(speakNext, 40);
    } else {
      speakNext();
    }
    clearKeepAlive();
    keepAlive.current = window.setInterval(() => {
      if (synth.speaking && !synth.paused) synth.resume();
    }, 8000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (speaking ? stop() : start())}
        className="cs-btn cs-btn-cobalt h-10 px-4 text-[11px] tracking-[0.14em] uppercase"
        aria-pressed={speaking}
      >
        {speaking ? stopLabel : listenLabel}
      </button>
      <p className="sr-only" aria-live="polite">
        {missing ? missingLabel : speaking ? statusLabel : ""}
      </p>
      {missing ? <p className="text-xs text-copper">{missingLabel}</p> : null}
    </>
  );
}
