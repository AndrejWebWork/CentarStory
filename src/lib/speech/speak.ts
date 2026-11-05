import { intlTag } from "@/lib/format";
import { playNeural, primeAudio, stopNeural } from "@/lib/speech/neural";

const NEURAL = /natural|neural|premium|enhanced|wavenet|online|google/;
const HARSH = /espeak|compact|festival/;
const DESKTOP_MALE = /\b(david|mark|george)\b/;

function voiceScore(voice: SpeechSynthesisVoice, lang: string) {
  const voiceLang = voice.lang.toLowerCase().replaceAll("_", "-");
  const want = lang.toLowerCase();
  const base = want.slice(0, 2);
  if (!voiceLang.startsWith(base)) return -1;
  let score = voiceLang === want ? 160 : 90;
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  if (NEURAL.test(name)) score += 140;
  if (!voice.localService) score += 40;
  if (HARSH.test(name)) score -= 120;
  if (DESKTOP_MALE.test(name) && !NEURAL.test(name)) score -= 50;
  if (/\bzira\b/.test(name)) score += 18;
  return score;
}

export function loadVoices(synth: SpeechSynthesis) {
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

function softFallback(voices: SpeechSynthesisVoice[]) {
  const named = voices.map((voice) => ({
    voice,
    name: `${voice.name} ${voice.voiceURI}`.toLowerCase(),
  }));
  return (
    named.find((entry) => NEURAL.test(entry.name) && !HARSH.test(entry.name))?.voice ??
    named.find((entry) => /\bzira\b/.test(entry.name))?.voice ??
    named.find((entry) => !DESKTOP_MALE.test(entry.name) && !HARSH.test(entry.name))?.voice ??
    voices.find((voice) => voice.default) ??
    voices[0]
  );
}

export function bestVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const match = voices
    .map((voice) => ({ voice, score: voiceScore(voice, lang) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.voice;
  return match ?? softFallback(voices);
}

export function tune(utterance: SpeechSynthesisUtterance, voice: SpeechSynthesisVoice | undefined, lang: string) {
  const name = `${voice?.name ?? ""} ${voice?.voiceURI ?? ""}`.toLowerCase();
  const neural = NEURAL.test(name);
  utterance.lang = voice?.lang || lang;
  utterance.rate = neural ? 0.95 : 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;
  if (voice) utterance.voice = voice;
}

let token = 0;

function phrases(text: string) {
  const parts = text
    .split(/(?<=[.!?…])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text];
}

function speakWithSystem(
  parts: string[],
  locale: string,
  id: number,
  hooks?: { onReady?: () => void; onEnd?: () => void },
) {
  const synth = window.speechSynthesis;
  if (!synth) {
    hooks?.onReady?.();
    hooks?.onEnd?.();
    return;
  }
  const lang = intlTag(locale);
  void loadVoices(synth).then((voices) => {
    if (id !== token) return;
    const voice = bestVoice(voices, lang);
    hooks?.onReady?.();
    const say = (index: number) => {
      if (id !== token) return;
      const part = parts[index];
      if (!part) {
        hooks?.onEnd?.();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(part);
      tune(utterance, voice, lang);
      utterance.onend = () => {
        if (id !== token) return;
        window.setTimeout(() => say(index + 1), 160);
      };
      utterance.onerror = () => {
        if (id !== token) return;
        say(index + 1);
      };
      synth.speak(utterance);
    };
    say(0);
  });
}

export function speakParts(
  parts: string[],
  locale: string,
  hooks?: { onReady?: () => void; onEnd?: () => void },
) {
  if (typeof window === "undefined") return;
  const lines = parts.map((part) => part.trim()).filter(Boolean);
  if (lines.length === 0) return;
  const id = ++token;
  primeAudio();
  stopNeural();
  window.speechSynthesis?.cancel();
  void playNeural(lines, locale, () => id === token, hooks?.onReady).then((result) => {
    if (id !== token) return;
    if (result === "failed") {
      speakWithSystem(lines, locale, id, hooks);
      return;
    }
    if (result === "done") hooks?.onEnd?.();
  });
}

export function speak(text: string, locale: string) {
  const line = text.replace(/\s+/g, " ").trim();
  if (!line) return;
  speakParts(phrases(line), locale);
}

export function stopSpeaking() {
  token += 1;
  stopNeural();
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
