import { intlTag } from "@/lib/format";

function voiceScore(voice: SpeechSynthesisVoice, lang: string) {
  const voiceLang = voice.lang.toLowerCase().replaceAll("_", "-");
  const want = lang.toLowerCase();
  const base = want.slice(0, 2);
  if (!voiceLang.startsWith(base)) return -1;
  let score = voiceLang === want ? 140 : 80;
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  if (/natural|neural|premium|enhanced|wavenet|online/.test(name)) score += 90;
  if (name.includes("google")) score += 50;
  if (/espeak|compact|festival/.test(name)) score -= 70;
  return score;
}

export function speak(text: string, locale: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const line = text.replace(/\s+/g, " ").trim();
  if (!line) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(line);
  const lang = intlTag(locale);
  utter.lang = lang;
  utter.rate = 0.94;
  const voice = synth
    .getVoices()
    .map((item) => ({ item, score: voiceScore(item, lang) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.item;
  if (voice) utter.voice = voice;
  synth.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
