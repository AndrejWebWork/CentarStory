"use client";

import { useEffect, useRef, useState } from "react";
import { intlTag } from "@/lib/format";

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

function voiceScore(voice: SpeechSynthesisVoice, lang: string) {
  const voiceLang = voice.lang.toLowerCase().replaceAll("_", "-");
  const want = lang.toLowerCase();
  const base = want.slice(0, 2);
  if (!voiceLang.startsWith(base)) return -1;
  let score = voiceLang === want ? 140 : 80;
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  if (/natural|neural|premium|enhanced|wavenet|online/.test(name)) score += 90;
  if (name.includes("google")) score += 50;
  if (/espeak|compact|festival|android/.test(name)) score -= 70;
  if (/(^| )(david|zira|mark|hazel)( |$)/.test(name) && !/natural|online|neural/.test(name)) score -= 25;
  return score;
}

function bestVoice(voices: SpeechSynthesisVoice[], lang: string) {
  return voices
    .map((voice) => ({ voice, score: voiceScore(voice, lang) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.voice;
}

function loadVoices(synth: SpeechSynthesis) {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const current = synth.getVoices();
    if (current.length > 0) {
      resolve(current);
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", finish);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", finish);
    window.setTimeout(finish, 900);
  });
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
      utterance.lang = voice?.lang || lang;
      utterance.rate = 0.94;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;
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
        <span className="cs-reel" aria-hidden="true" />
        <span className="cs-tape-window">
          <span className="cs-tape-film" aria-hidden="true" />
          <span className="cs-tape-word">{speaking ? stopLabel : listenLabel}</span>
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
