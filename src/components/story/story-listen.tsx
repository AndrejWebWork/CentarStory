"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { speakParts, stopSpeaking } from "@/lib/speech/speak";

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
  const story = useTranslations("story");
  const [speaking, setSpeaking] = useState(false);
  const [warming, setWarming] = useState(false);
  const [missing, setMissing] = useState(false);
  const stopRef = useRef(false);
  const script = [title, ...paragraphs].filter(Boolean).join(". ");

  function stop() {
    stopRef.current = true;
    stopSpeaking();
    setSpeaking(false);
    setWarming(false);
  }

  useEffect(() => {
    return () => {
      stopRef.current = true;
      stopSpeaking();
    };
  }, [script]);

  function start() {
    const pieces = piecesOf(script);
    if (pieces.length === 0) return;
    if (typeof window === "undefined") {
      setMissing(true);
      return;
    }
    stopRef.current = false;
    setMissing(false);
    setWarming(true);
    setSpeaking(true);
    speakParts(pieces, locale, {
      onReady: () => {
        if (!stopRef.current) setWarming(false);
      },
      onEnd: () => {
        if (stopRef.current) return;
        setSpeaking(false);
        setWarming(false);
      },
    });
  }

  return (
    <div className="cs-listen">
      <p className="cs-listen-prompt">{promptLabel}</p>
      <button
        type="button"
        onClick={() => (speaking ? stop() : void start())}
        className={speaking ? "cs-tape is-playing" : "cs-tape"}
        aria-pressed={speaking}
        aria-label={warming ? story("listenWarm") : speaking ? stopLabel : listenLabel}
      >
        <span className="cs-tape-word">{warming ? story("listenWarm") : speaking ? stopLabel : listenLabel}</span>
        <span className="cs-tape-window" aria-hidden="true">
          <span className="cs-tape-film" />
        </span>
        <span className="cs-reel" aria-hidden="true" />
      </button>
      <p className="sr-only" aria-live="polite">
        {missing ? missingLabel : warming ? story("listenWarm") : speaking ? statusLabel : ""}
      </p>
      {missing ? <p className="cs-listen-missing">{missingLabel}</p> : null}
    </div>
  );
}
