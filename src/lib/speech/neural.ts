import type { TtsSession, VoiceId } from "@mintplex-labs/piper-tts-web";

const VOICES: Record<string, VoiceId> = {
  en: "en_GB-alba-medium",
  mk: "sr_RS-serbski_institut-medium",
  sr: "sr_RS-serbski_institut-medium",
  tr: "tr_TR-dfki-medium",
  uk: "uk_UA-ukrainian_tts-medium",
  sq: "en_GB-alba-medium",
};

const WASM = {
  onnxWasm: "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.21.0/",
  piperWasm: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm",
  piperData: "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
};

let playbackStop: (() => void) | null = null;
let sessionPromise: Promise<TtsSession> | null = null;
let sessionVoice: VoiceId | null = null;
let audioCtx: AudioContext | null = null;

export function primeAudio() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext;
  if (!Ctx) return;
  audioCtx = audioCtx ?? new Ctx();
  void audioCtx.resume();
}

export function stopNeural() {
  playbackStop?.();
  playbackStop = null;
}

function voiceFor(locale: string): VoiceId {
  return VOICES[locale.slice(0, 2)] ?? VOICES.en;
}

async function sessionFor(voiceId: VoiceId) {
  if (sessionPromise && sessionVoice === voiceId) return sessionPromise;
  stopNeural();
  sessionVoice = voiceId;
  sessionPromise = (async () => {
    const { TtsSession } = await import("@mintplex-labs/piper-tts-web");
    if (TtsSession._instance && TtsSession._instance.voiceId !== voiceId) {
      TtsSession._instance = null;
    }
    const cores = navigator.hardwareConcurrency;
    try {
      Object.defineProperty(navigator, "hardwareConcurrency", {
        configurable: true,
        get: () => 1,
      });
    } catch {
      /* Threaded WASM needs special headers this site does not set. */
    }
    try {
      return await TtsSession.create({ voiceId, wasmPaths: WASM });
    } finally {
      try {
        Object.defineProperty(navigator, "hardwareConcurrency", {
          configurable: true,
          get: () => cores,
        });
      } catch {
        /* Leave the single-thread override if the browser locked the property. */
      }
    }
  })().catch((error: unknown) => {
    sessionPromise = null;
    sessionVoice = null;
    throw error;
  });
  return sessionPromise;
}

function playPcm(blob: Blob, alive: () => boolean) {
  return blob.arrayBuffer().then(async (bytes) => {
    primeAudio();
    const ctx = audioCtx;
    if (!ctx) throw new Error("audio");
    if (ctx.state === "suspended") await ctx.resume();
    const buffer = await ctx.decodeAudioData(bytes.slice(0));
    if (!alive()) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    await new Promise<void>((resolve) => {
      playbackStop = () => {
        try {
          source.stop();
        } catch {
          /* Already stopped. */
        }
        resolve();
      };
      source.onended = () => {
        playbackStop = null;
        resolve();
      };
      source.start();
    });
  });
}

export async function playNeural(
  parts: string[],
  locale: string,
  alive: () => boolean,
  onReady?: () => void,
): Promise<"done" | "stopped" | "failed"> {
  try {
    const session = await sessionFor(voiceFor(locale));
    let started = false;
    for (const part of parts) {
      const line = part.trim();
      if (!line) continue;
      if (!alive()) return "stopped";
      const blob = await session.predict(line);
      if (!alive()) return "stopped";
      if (!started) {
        started = true;
        onReady?.();
      }
      await playPcm(blob, alive);
      if (!alive()) return "stopped";
    }
    if (!started) onReady?.();
    return alive() ? "done" : "stopped";
  } catch {
    return "failed";
  }
}
