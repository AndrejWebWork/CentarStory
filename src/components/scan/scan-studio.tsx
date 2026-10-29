"use client";

import { Camera, ImageUp, MapPin, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { pick } from "@/content/copy";
import { getPlace, places, sitePath } from "@/content/places";
import { getMedia } from "@/content/knowledge/media";
import { walksThrough } from "@/content/journeys";
import { Link } from "@/i18n/navigation";
import type { Evidence } from "@/lib/recognition/analyze";
import { requestRemoteRecognition } from "@/lib/recognition/client";
import { capDisplayedScore } from "@/lib/recognition/fuse";
import { recognizeOnDevice } from "@/lib/recognition/on-device";
import { canvasFromFile, canvasFromVideo, jpegFromCanvas, validateFile } from "@/lib/recognition/prepare";
import { referenceBindings } from "@/lib/recognition/catalogue";
import type { LocationHint, RecognitionResult } from "@/lib/recognition/types";
import { mediaSrc } from "@/lib/media/src";
import { useMounted } from "@/lib/use-mounted";

type Phase = "idle" | "live" | "review" | "reading" | "result";
type ScanError = "camera" | "permission" | "unsupported" | "file" | "type" | "size" | "network" | "timeout";
type Stage = "decode" | "sample" | "compare" | "remote";
type Mode = "unknown" | "demo" | "remote";

export function ScanStudio() {
  const t = useTranslations("scan");
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState<Stage>("decode");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<ScanError | null>(null);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [mode, setMode] = useState<Mode>("unknown");
  const [location, setLocation] = useState<LocationHint | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/status")
      .then((response) => response.json())
      .then((data: { recognition?: { mode?: string } }) => {
        if (cancelled) return;
        setMode(data.recognition?.mode === "remote" ? "remote" : "demo");
      })
      .catch(() => {
        if (!cancelled) setMode("demo");
      });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (phase === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play();
    }
  }, [phase]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      setPhase("live");
    } catch (caught) {
      const name = caught instanceof DOMException ? caught.name : "";
      setError(name === "NotAllowedError" || name === "PermissionDeniedError" ? "permission" : "camera");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = canvasFromVideo(video);
    shotRef.current = canvas;
    setPreview(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
    setPhase("review");
  }

  async function loadFile(file: File) {
    setError(null);
    const invalid = validateFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    try {
      const canvas = await canvasFromFile(file);
      shotRef.current = canvas;
      setPreview(canvas.toDataURL("image/jpeg", 0.9));
      stopCamera();
      setPhase("review");
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "file";
      setError(code === "type" || code === "size" ? code : "file");
    }
  }

  function askLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    );
  }

  async function readPhotograph() {
    const shot = shotRef.current;
    if (!shot) return;
    setPhase("reading");
    setError(null);
    setStage("decode");
    await wait(40);
    let jpeg: { canvas: HTMLCanvasElement; dataUrl: string };
    try {
      jpeg = jpegFromCanvas(shot);
    } catch {
      setError("file");
      setPhase("review");
      return;
    }
    setStage("sample");
    const local = await recognizeOnDevice(jpeg.canvas, location);
    setEvidence(local.evidence);
    setStage("compare");
    await wait(40);

    if (mode === "remote") {
      setStage("remote");
      try {
        const remote = await requestRemoteRecognition({
          dataUrl: jpeg.dataUrl,
          location,
          structure: local.structure,
        });
        setResult(remote);
        setPhase("result");
        return;
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "network";
        setError(message === "timeout" ? "timeout" : "network");
        setResult({ ...local.result, note: "fallback-local" });
        setPhase("result");
        return;
      }
    }

    setResult(local.result);
    setPhase("result");
  }

  function resetShot() {
    setPreview(null);
    shotRef.current = null;
    setResult(null);
    setEvidence(null);
    setPhase("idle");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
      <header className="max-w-2xl">
        <p className="text-[11px] tracking-[0.22em] text-brass uppercase">02 — {t("kicker")}</p>
        <h1 className="mt-3 font-display text-5xl leading-[0.92] sm:text-7xl">{t("title")}</h1>
        <p className="mt-5 text-base leading-relaxed text-ink-soft">{t("lede")}</p>
        <p className="mt-4 text-sm text-patina" role="status">
          {mode === "remote" ? t("modeRemote") : mode === "demo" ? t("modeDemo") : t("modeUnknown")}
        </p>
        <p className="mt-2 text-sm text-ink-soft">{mode === "remote" ? t("privacyRemote") : t("privacy")}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div
            className="relative overflow-hidden border border-line bg-ink"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files[0];
              if (file) void loadFile(file);
            }}
          >
            {phase === "live" ? (
              <video
                ref={videoRef}
                className="h-[70vh] min-h-[420px] w-full object-cover"
                playsInline
                muted
                aria-label={t("liveLabel")}
              />
            ) : preview ? (
              // Visitor's own photograph, produced in this browser.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={t("previewAlt")} className="h-[70vh] min-h-[420px] w-full object-cover" />
            ) : (
              <div className="flex h-[70vh] min-h-[420px] flex-col justify-end bg-[radial-gradient(circle_at_50%_40%,#3a2e27,transparent_55%),linear-gradient(180deg,#1c1612,#2a211c)] p-7 text-foam">
                <p className="font-display text-4xl leading-none">{t("lensIdle")}</p>
                <p className="mt-3 max-w-sm text-sm text-foam/70">{t("lensHint")}</p>
              </div>
            )}
            <LensGuides live={phase === "live"} reading={phase === "reading"} />
            {phase === "reading" ? (
              <div className="absolute inset-x-0 bottom-0 bg-ink/70 px-5 py-4 text-sm text-foam" role="status">
                {t("reading")} — {t(`stage${capitalize(stage)}`)}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {phase !== "live" ? (
              <button type="button" onClick={startCamera} className="inline-flex h-12 items-center gap-2 bg-ink px-5 text-sm text-foam">
                <Camera className="size-4" aria-hidden="true" />
                {t("startCamera")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={capture}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-copper text-foam"
                  aria-label={t("shutter")}
                >
                  <span className="h-8 w-8 rounded-full border-2 border-foam" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setPhase("idle");
                  }}
                  className="inline-flex h-12 items-center border border-line px-4 text-sm"
                >
                  {t("stopCamera")}
                </button>
              </>
            )}
            <label className="inline-flex h-12 cursor-pointer items-center gap-2 border border-line px-4 text-sm">
              <ImageUp className="size-4" aria-hidden="true" />
              {t("upload")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void loadFile(file);
                  event.target.value = "";
                }}
              />
            </label>
            {phase === "review" || (phase === "result" && preview) ? (
              <>
                {phase === "review" ? (
                  <button type="button" onClick={readPhotograph} className="inline-flex h-12 items-center bg-copper px-4 text-sm text-foam">
                    {t("read")}
                  </button>
                ) : null}
                <button type="button" onClick={resetShot} className="inline-flex h-12 items-center gap-2 px-4 text-sm">
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {t("retake")}
                </button>
              </>
            ) : null}
            {phase === "result" && error === "network" ? (
              <button type="button" onClick={readPhotograph} className="inline-flex h-12 items-center border border-line px-4 text-sm">
                {t("retry")}
              </button>
            ) : null}
            <button type="button" onClick={askLocation} className="inline-flex h-12 items-center gap-2 px-3 text-sm text-ink-soft">
              <MapPin className="size-4" aria-hidden="true" />
              {locating ? t("locating") : location ? t("located") : t("useLocation")}
            </button>
          </div>
          <div aria-live="polite" className="mt-4 text-sm text-copper">
            {error ? <p>{t(`errors.${error}`)}</p> : null}
          </div>
        </div>

        <aside className="lg:col-span-5">
          {phase === "result" && result ? (
            <Results result={result} evidence={evidence} locale={locale} />
          ) : (
            <div className="border border-line bg-foam p-5">
              <h2 className="font-display text-3xl">{t("how")}</h2>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                <li>1. {t("stepCamera")}</li>
                <li>2. {t("stepReview")}</li>
                <li>3. {t("stepMatch")}</li>
                <li>4. {t("stepStory")}</li>
              </ol>
            </div>
          )}
        </aside>
      </div>

      {mode !== "remote" ? <ReferenceCatalog locale={locale} /> : null}

      <section className="mt-12">
        <h2 className="font-display text-3xl">{t("catalog")}</h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">{t("catalogNote")}</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {places.map((place) => (
            <li key={place.slug}>
              <Link href={sitePath(place)} className="flex min-h-14 items-center justify-between gap-4 py-3">
                <span>{pick(place.name, locale)}</span>
                <span className="text-sm text-brass">
                  {place.municipality === "nearby" ? `${t("nearby")} · ` : ""}
                  {pick(place.era, locale)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Results({
  result,
  evidence,
  locale,
}: {
  result: RecognitionResult;
  evidence: Evidence | null;
  locale: string;
}) {
  const t = useTranslations("scan");
  const headline =
    result.outcome === "identified"
      ? t("identified")
      : result.outcome === "candidates"
        ? t("choose")
        : result.outcome === "out-of-catalogue"
          ? t("outOfCatalogue")
          : t("unknown");

  return (
    <section className="border border-line bg-foam p-5">
      <p className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("resultKicker")}</p>
      <h2 className="mt-2 font-display text-4xl leading-none">{headline}</h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {result.mode === "remote" ? t("resultRemote") : t("resultDemo")}
      </p>
      {result.note === "fallback-local" ? <p className="mt-2 text-sm text-copper">{t("fallbackLocal")}</p> : null}
      {result.usedLocation ? <p className="mt-2 text-xs text-ink-soft">{t("locationUsed")}</p> : null}
      {result.candidates.length === 0 ? <p className="mt-4 text-sm">{t("unknownBody")}</p> : null}
      <ul className="mt-5 space-y-3">
        {result.candidates.map((candidate, index) => {
          const place = getPlace(candidate.slug);
          if (!place) return null;
          const walks = walksThrough(place.slug);
          const path = sitePath(place);
          return (
            <li key={candidate.slug} className="border border-line p-4">
              <p className="text-[11px] tracking-[0.16em] text-brass uppercase">
                {index === 0 && result.outcome === "identified" ? t("leading") : t("candidate")}
              </p>
              <p className="mt-1 font-display text-3xl leading-none">{pick(place.name, locale)}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {t("score", { score: capDisplayedScore(candidate.score) })} · {candidate.sources.join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link href={path} className="text-copper">
                  {t("open")}
                </Link>
                <Link href={`${path}#architecture`} className="text-copper">
                  {t("openArchitecture")}
                </Link>
                <Link href={`${path}#legends`} className="text-copper">
                  {t("openLegends")}
                </Link>
                <Link href={`/?place=${place.slug}`} className="text-copper">
                  {t("onMap")}
                </Link>
                {walks[0] ? (
                  <Link href={`/?walk=${walks[0].slug}`} className="text-copper">
                    {t("makeRoute")}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {evidence ? <EvidenceMeters evidence={evidence} /> : null}
    </section>
  );
}

function ReferenceCatalog({ locale }: { locale: string }) {
  const t = useTranslations("scan");
  const ready = useMounted();
  const refs = referenceBindings()
    .map((binding) => {
      const place = getPlace(binding.slug);
      const image = getMedia(binding.imageId);
      if (!place || !image) return null;
      return { place, image };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (refs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-3xl">{t("references")}</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">{t("referencesNote")}</p>
      {ready ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {refs.map(({ place, image }) => (
            <li key={`${place.slug}-${image.id}`} className="border border-line bg-foam">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc(image, 640)} alt={pick(image.caption, locale)} className="aspect-[16/10] w-full object-cover" />
              <div className="p-4">
                <p className="font-display text-2xl leading-none">{pick(place.name, locale)}</p>
                <p className="mt-2 text-xs text-ink-soft">
                  {image.credit} · {image.license}
                </p>
                <Link href={sitePath(place)} className="mt-3 inline-flex h-10 items-center text-sm text-copper">
                  {t("open")}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 h-40 bg-paper-2" />
      )}
    </section>
  );
}

function EvidenceMeters({ evidence }: { evidence: Evidence }) {
  const t = useTranslations("scan");
  const rows: { key: keyof Evidence; label: string }[] = [
    { key: "brightness", label: t("brightness") },
    { key: "warmth", label: t("warmth") },
    { key: "saturation", label: t("saturation") },
    { key: "horizontal", label: t("horizontal") },
    { key: "vertical", label: t("vertical") },
    { key: "green", label: t("green") },
  ];
  return (
    <div className="mt-6">
      <h3 className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("evidence")}</h3>
      <dl className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
            <dt>{row.label}</dt>
            <dd className="h-1 bg-paper-2">
              <span className="block h-1 bg-copper" style={{ width: `${Math.round(evidence[row.key] * 100)}%` }} />
            </dd>
            <dd className="text-right text-ink-soft">{Math.round(evidence[row.key] * 100)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function LensGuides({ live, reading }: { live: boolean; reading: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-4" aria-hidden="true">
      <span className="absolute top-0 left-0 h-8 w-8 border-t border-l border-foam/70" />
      <span className="absolute top-0 right-0 h-8 w-8 border-t border-r border-foam/70" />
      <span className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-foam/70" />
      <span className="absolute right-0 bottom-0 h-8 w-8 border-b border-r border-foam/70" />
      {live || reading ? <span className="absolute inset-x-10 top-1/2 h-px bg-copper/50" /> : null}
      {reading ? <span className="cs-lens-scan absolute inset-x-8 h-16 bg-[linear-gradient(180deg,transparent,rgba(122,59,42,0.35),transparent)]" /> : null}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
