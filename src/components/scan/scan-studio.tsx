"use client";

import { ImageUp, ListFilter, RotateCcw, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getPlace, places, sitePath } from "@/content/places";
import { Link, useRouter } from "@/i18n/navigation";
import { SkeletonOverlay } from "@/components/scan/skeleton-overlay";
import { SCAN_CAPTURE_STORAGE_KEY } from "@/components/story/cinematic-scenes";
import type { ImageQualityIssue } from "@/lib/recognition/analyze";
import { requestRemoteRecognition } from "@/lib/recognition/client";
import { recognizeOnDevice } from "@/lib/recognition/on-device";
import { canvasFromFile, canvasFromVideo, jpegFromCanvas, type PrepareError } from "@/lib/recognition/prepare";
import { subscribeArmedCamera, takeArmedCamera } from "@/lib/scan/arm-camera";
import { skeletonFromCanvas, type SkeletonMesh } from "@/lib/recognition/skeleton";
import type { LocationHint, RecognitionResult } from "@/lib/recognition/types";

type Phase = "live" | "reading" | "opening" | "result";
type ScanError = "camera" | "permission" | "unsupported" | PrepareError | "network" | "timeout";
type Mode = "unknown" | "demo" | "remote";

function rememberCapture(slug: string, dataUrl: string) {
  try {
    window.sessionStorage.setItem(SCAN_CAPTURE_STORAGE_KEY, JSON.stringify({ slug, dataUrl }));
  } catch {
    /* Session storage is optional. */
  }
}

export function ScanStudio() {
  const t = useTranslations("scan");
  const locale = useLocale();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("live");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<ScanError | null>(null);
  const [qualityIssue, setQualityIssue] = useState<ImageQualityIssue>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [mode, setMode] = useState<Mode>("unknown");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [skeleton, setSkeleton] = useState<SkeletonMesh | null>(null);
  const [revealResult, setRevealResult] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/integrations/status")
      .then((response) => response.json())
      .then((data: { recognition?: { mode?: string } }) => {
        if (!cancelled) setMode(data.recognition?.mode === "remote" ? "remote" : "demo");
      })
      .catch(() => {
        if (!cancelled) setMode("demo");
      });

    const pendingCamera = takeArmedCamera();
    if (pendingCamera) {
      void pendingCamera.then((armed) => {
        if (cancelled) {
          if ("stream" in armed) armed.stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if ("stream" in armed) {
          streamRef.current = armed.stream;
          setLiveStream(armed.stream);
          setPhase("live");
          return;
        }
        setError(armed.error);
      });
    } else {
      void openCamera();
    }

    const unsubscribe = subscribeArmedCamera((next) => {
      if ("error" in next) {
        setError(next.error);
        return;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = next.stream;
      setLiveStream(next.stream);
      setError(null);
      setPreview(null);
      setPhase("live");
    });

    return () => {
      cancelled = true;
      unsubscribe();
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (phase !== "live" || !video || !liveStream) return;
    video.srcObject = liveStream;
    void video.play().catch(() => undefined);
  }, [phase, liveStream]);

  useEffect(() => {
    if (phase !== "result") {
      setRevealResult(false);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setRevealResult(true), reduce || !skeleton ? 0 : 1450);
    return () => window.clearTimeout(timer);
  }, [phase, skeleton]);

  function readLocation(): Promise<LocationHint | null> {
    if (!navigator.geolocation) return Promise.resolve(null);
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => resolve(null), 1400);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          window.clearTimeout(timer);
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => {
          window.clearTimeout(timer);
          resolve(null);
        },
        { enableHighAccuracy: true, maximumAge: 20_000, timeout: 1200 },
      );
    });
  }

function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLiveStream(null);
  }

  async function openCamera() {
    setError(null);
    setQualityIssue(null);
    setResult(null);
    setPreview(null);
    setSkeleton(null);
    setRevealResult(false);
    shotRef.current = null;
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
      setLiveStream(stream);
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      setPhase("live");
    } catch (caught) {
      const name = caught instanceof DOMException ? caught.name : "";
      setError(name === "NotAllowedError" || name === "PermissionDeniedError" ? "permission" : "camera");
    }
  }

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = canvasFromVideo(video);
    shotRef.current = canvas;
    setPreview(canvas.toDataURL("image/jpeg", 0.9));
    stopCamera();
    await readPhotograph();
  }

  async function pickFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setQualityIssue(null);
    try {
      const canvas = await canvasFromFile(file);
      shotRef.current = canvas;
      setPreview(canvas.toDataURL("image/jpeg", 0.9));
      stopCamera();
      await readPhotograph();
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "file";
      setError(code === "type" || code === "size" ? code : "file");
    }
  }

  async function readPhotograph() {
    const shot = shotRef.current;
    if (!shot) return;
    setPhase("reading");
    setError(null);
    let jpeg: { canvas: HTMLCanvasElement; dataUrl: string };
    try {
      jpeg = jpegFromCanvas(shot);
    } catch (caught) {
      const code = caught instanceof Error && caught.message === "size" ? "size" : "file";
      setError(code);
      void openCamera();
      return;
    }
    setSkeleton(skeletonFromCanvas(jpeg.canvas));
    const local = await recognizeOnDevice(jpeg.canvas, null);
    setQualityIssue(local.qualityIssue);

    const finish = (next: RecognitionResult) => {
      const slug = local.result.outcome === "identified" ? local.result.candidates[0]?.slug : undefined;
      const place = slug ? getPlace(slug) : undefined;
      if (place && slug) {
        rememberCapture(slug, jpeg.dataUrl);
        setResult(local.result);
        setPhase("opening");
        router.push(`${sitePath(place)}?from=scan`);
        return;
      }
      setResult({
        ...next,
        outcome: next.outcome === "out-of-catalogue" ? "out-of-catalogue" : "unknown",
        candidates: [],
      });
      setPhase("result");
    };

    if (local.result.outcome === "identified") {
      finish(local.result);
      return;
    }

    if (mode === "remote") {
      try {
        const location = await readLocation();
        const remote = await requestRemoteRecognition({
          dataUrl: jpeg.dataUrl,
          location,
          structure: local.structure,
        });
        finish(remote);
        return;
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "network";
        if (message !== "unconfigured") {
          setError(message === "timeout" ? "timeout" : "network");
        }
        finish({ ...local.result, note: "fallback-local" });
        return;
      }
    }

    finish(local.result);
  }

  const filteredCatalog = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return places;
    return places.filter((place) => {
      const site = getSite(place.slug);
      const aliases = site ? `${site.nameMk} ${site.alternativeNames.join(" ")} ${site.transliterations.join(" ")}` : "";
      return `${pick(place.name, locale)} ${pick(place.eyebrow, locale)} ${pick(place.address, locale)} ${aliases}`
        .toLowerCase()
        .includes(needle);
    });
  }, [locale, query]);

  return (
    <div className="relative min-h-[calc(100dvh-5.25rem)] overflow-hidden bg-ink lg:min-h-[calc(100dvh-5.75rem)]">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={t("upload")}
        onChange={(event) => {
          void pickFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {phase === "live" ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
          autoPlay
          aria-label={t("liveLabel")}
        />
      ) : preview ? (
        // Visitor's own photograph, produced in this browser.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={t("previewAlt")} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-ink" />
      )}
      <SkeletonOverlay
        mesh={skeleton}
        active={Boolean(skeleton) && (phase === "reading" || phase === "result")}
        locked={phase === "opening" || result?.outcome === "identified"}
        failed={phase === "result" && (result?.outcome === "unknown" || result?.outcome === "out-of-catalogue")}
      />
      <div className="pointer-events-none absolute inset-x-5 top-5 bottom-36 sm:inset-x-10 sm:top-10 lg:bottom-10" aria-hidden="true">
        <span className="absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-foam" />
        <span className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-foam" />
        <span className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-foam" />
        <span className="absolute right-0 bottom-0 h-10 w-10 border-b-2 border-r-2 border-foam" />
        {skeleton ? null : (
          <>
            <span className="absolute top-1/2 left-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-cobalt" />
            <span className="absolute top-1/2 left-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-cobalt" />
          </>
        )}
      </div>
      {phase === "reading" || phase === "opening" ? (
        <p
          className="absolute inset-x-0 top-[18%] z-10 text-center text-[10px] tracking-[0.28em] text-foam/80 uppercase"
          role="status"
        >
          {phase === "opening" ? t("identified") : t("stageSample")}
        </p>
      ) : null}
      <div className="absolute inset-x-0 bottom-36 z-10 mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 pb-[env(safe-area-inset-bottom)] lg:bottom-8">
        {phase === "result" && result && revealResult ? (
          <Results
            result={result}
            qualityIssue={qualityIssue}
            onOpenCatalog={() => setCatalogOpen(true)}
          />
        ) : null}
        {error ? (
          <p className="rounded-2xl border border-foam/30 bg-ink/85 px-4 py-2 text-center text-xs text-foam" role="alert">
            {t(`errors.${error}`)}
          </p>
        ) : null}
        {phase === "live" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid size-12 place-items-center rounded-full border border-foam/60 bg-ink/70 text-foam hover:border-foam"
                aria-label={t("upload")}
                title={t("upload")}
              >
                <ImageUp className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void capture()}
                className="grid size-16 place-items-center rounded-full border-2 border-foam bg-ink/60"
                aria-label={t("shutter")}
                title={t("shutter")}
              >
                <span className="size-10 rounded-full bg-cobalt" />
              </button>
              <button
                type="button"
                onClick={() => setCatalogOpen(true)}
                className="grid size-12 place-items-center rounded-full border border-foam/60 bg-ink/70 text-foam hover:border-foam"
                aria-label={t("catalog")}
                title={t("catalog")}
              >
                <ListFilter className="size-5" aria-hidden="true" />
              </button>
            </div>
            <p className="max-w-xs text-center text-[10px] leading-snug text-foam/65">
              {mode === "remote" ? t("privacyRemote") : t("privacy")}
            </p>
          </div>
        ) : phase === "result" && revealResult ? (
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void openCamera()}
              className="cs-btn cs-btn-ink h-11 border border-foam"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t("retake")}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="cs-btn cs-btn-ink h-11 border border-foam/60"
            >
              <ImageUp className="size-4" aria-hidden="true" />
              {t("upload")}
            </button>
            <button
              type="button"
              onClick={() => setCatalogOpen(true)}
              className="cs-btn cs-btn-ink h-11 border border-foam/60"
            >
              <ListFilter className="size-4" aria-hidden="true" />
              {t("catalog")}
            </button>
          </div>
        ) : null}
      </div>

      {catalogOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-ink/95 p-4 pb-36 text-foam sm:p-8 lg:pb-8"
          role="dialog"
          aria-modal="true"
          aria-label={t("catalog")}
        >
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between border-b border-foam/25 pb-4">
            <div>
              <p className="text-[10px] tracking-[0.22em] text-brass uppercase">{t("catalogNote")}</p>
              <h2 className="mt-1 font-display text-3xl">{t("catalog")}</h2>
            </div>
            <button
              type="button"
              onClick={() => setCatalogOpen(false)}
              className="grid size-11 place-items-center rounded-full border border-foam/40"
              aria-label={t("stopCamera")}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mx-auto mt-4 w-full max-w-3xl">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brass"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("catalog")}
                className="h-12 w-full rounded-2xl border border-foam/35 bg-ink pr-3 pl-10 text-sm text-foam"
              />
            </label>
          </div>
          <ul className="mx-auto mt-4 w-full max-w-3xl flex-1 divide-y divide-foam/20 overflow-y-auto border-y border-foam/20">
            {filteredCatalog.map((place, index) => (
              <li key={place.slug}>
                <Link
                  href={`${sitePath(place)}?from=scan`}
                  className="flex items-baseline justify-between gap-4 py-4 hover:text-brass"
                >
                  <div>
                    <span className="mr-3 font-display text-lg text-brass">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-2xl">{pick(place.name, locale)}</span>
                  </div>
                  <span className="text-[10px] tracking-[0.18em] text-foam/65 uppercase">
                    {pick(place.eyebrow, locale)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Results({
  result,
  qualityIssue,
  onOpenCatalog,
}: {
  result: RecognitionResult;
  qualityIssue: ImageQualityIssue;
  onOpenCatalog: () => void;
}) {
  const t = useTranslations("scan");

  return (
    <section className="w-full border border-line bg-paper p-5">
      <p className="text-[10px] tracking-[0.22em] text-copper uppercase">
        {result.outcome === "out-of-catalogue" ? t("outOfCatalogue") : t("resultKicker")}
      </p>
      <p className="mt-2 font-display text-3xl leading-none">{t("unknown")}</p>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{t("unknownBody")}</p>
      {qualityIssue ? (
        <p className="mt-2 border-l-2 border-copper pl-3 text-xs text-copper">
          {qualityIssue === "low-light" ? t("reasons.cool") : t("uncertain")}
        </p>
      ) : null}
      <button type="button" onClick={onOpenCatalog} className="cs-btn cs-btn-cobalt mt-4 w-full">
        {t("catalog")}
      </button>
    </section>
  );
}
