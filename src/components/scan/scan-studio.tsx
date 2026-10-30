"use client";

import { ArrowDownRight, ImageUp, ListFilter, RotateCcw, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plate } from "@/components/atlas/plate";
import { SCAN_CAPTURE_STORAGE_KEY } from "@/components/story/cinematic-scenes";
import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import { getPlace, places, sitePath } from "@/content/places";
import { walksThrough } from "@/content/journeys";
import { Link } from "@/i18n/navigation";
import { mediaSrc } from "@/lib/media/src";
import type { ImageQualityIssue } from "@/lib/recognition/analyze";
import { requestRemoteRecognition } from "@/lib/recognition/client";
import { recognizeOnDevice } from "@/lib/recognition/on-device";
import { canvasFromFile, canvasFromVideo, jpegFromCanvas, type PrepareError } from "@/lib/recognition/prepare";
import type { RecognitionResult } from "@/lib/recognition/types";

type Phase = "live" | "reading" | "result";
type ScanError = "camera" | "permission" | "unsupported" | PrepareError | "network" | "timeout";
type Mode = "unknown" | "demo" | "remote";

export function ScanStudio() {
  const t = useTranslations("scan");
  const locale = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("live");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<ScanError | null>(null);
  const [qualityIssue, setQualityIssue] = useState<ImageQualityIssue>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("unknown");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [query, setQuery] = useState("");

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

    void openCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function openCamera() {
    setError(null);
    setQualityIssue(null);
    setResult(null);
    setSelectedSlug(null);
    setPreview(null);
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
    const local = await recognizeOnDevice(jpeg.canvas);
    setQualityIssue(local.qualityIssue);

    if (mode === "remote") {
      try {
        const remote = await requestRemoteRecognition({
          dataUrl: jpeg.dataUrl,
          structure: local.structure,
        });
        setResult(remote);
        setSelectedSlug(remote.candidates[0]?.slug ?? null);
        setPhase("result");
        return;
      } catch (caught) {
        const message = caught instanceof Error ? caught.message : "network";
        if (message !== "unconfigured") {
          setError(message === "timeout" ? "timeout" : "network");
        }
        const fallback = { ...local.result, note: "fallback-local" };
        setResult(fallback);
        setSelectedSlug(fallback.candidates[0]?.slug ?? null);
        setPhase("result");
        return;
      }
    }

    setResult(local.result);
    setSelectedSlug(local.result.candidates[0]?.slug ?? null);
    setPhase("result");
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
    <div className="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden bg-ink lg:min-h-[calc(100dvh-4.4rem)]">
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
      <div className="pointer-events-none absolute inset-5 sm:inset-10" aria-hidden="true">
        <span className="absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-foam" />
        <span className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-foam" />
        <span className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-foam" />
        <span className="absolute right-0 bottom-0 h-10 w-10 border-b-2 border-r-2 border-foam" />
        <span className="absolute top-1/2 left-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-cobalt" />
        <span className="absolute top-1/2 left-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 bg-cobalt" />
        <span className="absolute top-2 left-3 text-[10px] tracking-[0.24em] text-foam/75 uppercase">
          41.9957°N · 21.4312°E
        </span>
      </div>
      {phase === "reading" ? (
        <>
          <div className="cs-lens-scan pointer-events-none absolute inset-x-6 top-1/3 h-px bg-cobalt sm:inset-x-10" />
          <p
            className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center text-xs tracking-[0.22em] text-foam uppercase"
            role="status"
          >
            {t("reading")}
          </p>
        </>
      ) : null}
      <div className="absolute inset-x-0 bottom-[4.75rem] z-10 mx-auto flex w-full max-w-xl flex-col items-center gap-3 px-4 pb-[env(safe-area-inset-bottom)] lg:bottom-8">
        {phase === "result" && result ? (
          <Results
            result={result}
            qualityIssue={qualityIssue}
            locale={locale}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
            onOpenCatalog={() => setCatalogOpen(true)}
          />
        ) : null}
        {error ? (
          <p className="border border-foam/30 bg-ink/85 px-4 py-2 text-center text-xs text-foam" role="alert">
            {t(`errors.${error}`)}
          </p>
        ) : null}
        {phase === "live" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid size-12 place-items-center border border-foam/60 bg-ink/70 text-foam hover:border-foam"
                aria-label={t("upload")}
                title={t("upload")}
              >
                <ImageUp className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void capture()}
                className="grid size-16 place-items-center border-2 border-foam bg-ink/60"
                aria-label={t("shutter")}
                title={t("shutter")}
              >
                <span className="size-10 bg-cobalt" />
              </button>
              <button
                type="button"
                onClick={() => setCatalogOpen(true)}
                className="grid size-12 place-items-center border border-foam/60 bg-ink/70 text-foam hover:border-foam"
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
        ) : phase !== "reading" ? (
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
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4 pb-24 text-foam sm:p-8 lg:pb-8"
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
              className="grid size-11 place-items-center border border-foam/40"
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
                className="h-12 w-full border border-foam/35 bg-ink pr-3 pl-10 text-sm text-foam"
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
  locale,
  selectedSlug,
  onSelect,
  onOpenCatalog,
}: {
  result: RecognitionResult;
  qualityIssue: ImageQualityIssue;
  locale: string;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onOpenCatalog: () => void;
}) {
  const t = useTranslations("scan");
  const story = useTranslations("story");
  const candidates = result.candidates
    .map((candidate) => ({ candidate, place: getPlace(candidate.slug) }))
    .filter(
      (
        entry,
      ): entry is {
        candidate: (typeof result.candidates)[number];
        place: NonNullable<ReturnType<typeof getPlace>>;
      } => Boolean(entry.place),
    );
  const active = candidates.find((entry) => entry.place.slug === selectedSlug) ?? candidates[0];

  if (result.outcome === "unknown" || result.outcome === "out-of-catalogue" || !active) {
    return (
      <section className="w-full border border-ink bg-paper p-5 shadow-[10px_10px_0_var(--ink)]">
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

  const { place } = active;
  const site = getSite(place.slug);
  const image = site?.images[0] ? getMedia(site.images[0]) : undefined;
  const folio = String(places.findIndex((item) => item.slug === place.slug) + 1).padStart(2, "0");
  const path = `${sitePath(place)}?from=scan`;
  const walk = walksThrough(place.slug)[0];
  const isSingleMatch = result.outcome === "identified";

  function rememberCaptureForStory(slug: string) {
    try {
      const imgEl = document.querySelector<HTMLImageElement>("img[src^='data:image/']");
      if (imgEl?.src) {
        window.sessionStorage.setItem(
          SCAN_CAPTURE_STORAGE_KEY,
          JSON.stringify({ slug, dataUrl: imgEl.src }),
        );
      }
    } catch {
      /* Session storage optional. */
    }
  }

  if (isSingleMatch) {
    return (
      <section className="w-full overflow-hidden border border-ink bg-paper shadow-[10px_10px_0_var(--ink)]">
        <div className="grid sm:grid-cols-[8.5rem_1fr]">
          <div className="relative h-36 overflow-hidden border-b border-ink bg-ink sm:h-auto sm:border-r sm:border-b-0">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaSrc(image, 640)}
                alt={pick(image.caption, locale)}
                className="h-full w-full object-cover"
              />
            ) : (
              <Plate
                motif={place.motif}
                palette={place.palette}
                index={folio}
                title={pick(place.name, locale)}
                eyebrow={story("noPhotograph")}
              />
            )}
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[10px] tracking-[0.22em] text-cobalt uppercase">{t("identified")}</p>
            <h2 className="mt-1 font-display text-3xl leading-none sm:text-4xl">{pick(place.name, locale)}</h2>
            <p className="mt-1 text-[11px] tracking-[0.14em] text-brass uppercase">{pick(place.eyebrow, locale)}</p>
            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-ink-soft">
              {pick(place.summary, locale)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={path}
                onClick={() => rememberCaptureForStory(place.slug)}
                className="cs-btn cs-btn-cobalt flex-1"
              >
                <span>{t("open")}</span>
                <ArrowDownRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={`/?place=${place.slug}`} className="cs-btn cs-btn-ghost">
                {t("onMap")}
              </Link>
            </div>
            <button
              type="button"
              onClick={onOpenCatalog}
              className="mt-3 block text-[11px] tracking-[0.14em] text-ink-soft uppercase underline"
            >
              {t("catalog")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full border border-ink bg-paper p-5 shadow-[10px_10px_0_var(--ink)]">
      <p className="text-[10px] tracking-[0.22em] text-copper uppercase">{t("choose")}</p>
      <h2 className="mt-2 font-display text-3xl leading-none sm:text-4xl">{pick(place.name, locale)}</h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{pick(place.summary, locale)}</p>

      {candidates.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {candidates.map((item) => (
            <button
              key={item.place.slug}
              type="button"
              onClick={() => onSelect(item.place.slug)}
              className={`cs-chip h-9 px-3 text-[11px] ${item.place.slug === place.slug ? "is-on" : ""}`}
            >
              {pick(item.place.name, locale)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={path}
          onClick={() => rememberCaptureForStory(place.slug)}
          className="cs-btn cs-btn-cobalt flex-1"
        >
          <span>{t("open")}</span>
          <ArrowDownRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href={`/?place=${place.slug}`} className="cs-btn cs-btn-ghost">
          {t("onMap")}
        </Link>
        {walk ? (
          <Link href={`/?walk=${walk.slug}`} className="cs-btn cs-btn-ghost">
            {t("makeRoute")}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
