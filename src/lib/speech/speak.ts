import { intlTag } from "@/lib/format";

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
  utterance.rate = neural ? 0.92 : 0.86;
  utterance.pitch = neural ? 1 : 1.02;
  utterance.volume = 1;
  if (voice) utterance.voice = voice;
}

let token = 0;

export function speak(text: string, locale: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const line = text.replace(/\s+/g, " ").trim();
  if (!line) return;
  const id = ++token;
  const synth = window.speechSynthesis;
  const lang = intlTag(locale);
  synth.cancel();
  window.setTimeout(() => {
    void loadVoices(synth).then((voices) => {
      if (id !== token) return;
      const utterance = new SpeechSynthesisUtterance(line);
      tune(utterance, bestVoice(voices, lang), lang);
      synth.speak(utterance);
    });
  }, 70);
}

export function stopSpeaking() {
  token += 1;
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
