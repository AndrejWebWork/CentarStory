"use client";

import dynamic from "next/dynamic";
import { Navigation, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AtlasMarker } from "@/components/map/explore-map";
import { haversineMeters } from "@/content/knowledge/boundary";
import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getPlace, sitePath } from "@/content/places";
import { MovementMasthead } from "@/components/around/movement-masthead";
import { Link } from "@/i18n/navigation";
import { coordinatesOf } from "@/lib/graph/query";
import {
  aroundMonumentStarts,
  documentedAtlasYears,
  aroundThemeForYear,
  aroundThemeRandom,
  type AroundThemeChoice,
} from "@/lib/itinerary/around-theme";
import { planItinerary, type ItineraryPlan } from "@/lib/itinerary";
import { useWalkingPath } from "@/lib/mapping/use-walking-path";
import { distanceBand, upcomingStep } from "@/lib/mapping/walk";
import { speak, stopSpeaking } from "@/lib/speech/speak";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-paper-2" /> },
);

const BUILD_STEPS = ["gather", "order", "hours", "path", "lock"] as const;
const ARRIVE_METERS = 40;

function snapOrigin(lat: number, lng: number) {
  const step = 0.00055;
  return {
    lat: Math.round(lat / step) * step,
    lng: Math.round(lng / step) * step,
  };
}

function themeKey(id: string) {
  return `theme_${id.replace(/[:.-]/g, "_")}`;
}

export function AroundGuide() {
  const t = useTranslations("around");
  const te = useTranslations("explore");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [yearText, setYearText] = useState("");
  const [yearError, setYearError] = useState(false);
  const [phase, setPhase] = useState<"idle" | "building" | "ready">("idle");
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<AroundThemeChoice | null>(null);
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [guiding, setGuiding] = useState(false);
  const [user, setUser] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [nextIndex, setNextIndex] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const announced = useRef(new Set<string>());
  const spoken = useRef({ slug: "", kind: "", street: "", band: Infinity });
  const advanceTimer = useRef<number | null>(null);
  const [voiceLine, setVoiceLine] = useState("");

  const points = useMemo(() => {
    if (!plan) return null;
    const mapped = plan.stops
      .map((stop) => coordinatesOf(stop.slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    return mapped.length > 1 ? mapped : null;
  }, [plan]);
  const { status: pathStatus, path } = useWalkingPath(points);
  const guidePoints = useMemo(() => {
    if (!guiding || !user || !plan) return null;
    const rest = plan.stops.slice(nextIndex).flatMap((stop) => {
      const point = coordinatesOf(stop.slug);
      return point ? [point] : [];
    });
    if (rest.length === 0) return null;
    return [snapOrigin(user.lat, user.lng), ...rest];
  }, [guiding, nextIndex, plan, user]);
  const { path: guidePath } = useWalkingPath(guidePoints, true);
  const nextStop = guiding ? plan?.stops[nextIndex] : undefined;
  const nextSite = nextStop ? getSite(nextStop.slug) : undefined;
  const nextPoint = nextStop ? coordinatesOf(nextStop.slug) : null;
  const metersToNext = user && nextPoint ? Math.round(haversineMeters(user, nextPoint)) : null;
  const atStop = metersToNext !== null && metersToNext <= ARRIVE_METERS;
  const lastStop = Boolean(plan && nextIndex >= plan.stops.length - 1);

  const routeMarkers: AtlasMarker[] = useMemo(() => {
    if (!plan) return [];
    return plan.stops.flatMap((stop) => {
      const site = getSite(stop.slug);
      if (!site) return [];
      return [
        {
          id: site.slug,
          lat: site.coordinates.lat,
          lng: site.coordinates.lng,
          label: pick(site.officialName, locale),
          tone: "site" as const,
        },
      ];
    });
  }, [locale, plan]);

  useEffect(() => {
    if (phase !== "building") return;
    if (reduce) {
      setPhase("ready");
      return;
    }
    const started = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - started;
      setStep(Math.min(BUILD_STEPS.length - 1, Math.floor(elapsed / 780)));
      if (elapsed >= BUILD_STEPS.length * 780) setPhase("ready");
    }, 80);
    return () => window.clearInterval(tick);
  }, [phase, reduce]);

  useEffect(() => {
    if (!guiding) return;
    if (!navigator.geolocation) {
      setGeoError(true);
      return;
    }
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        setUser({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoError(false);
      },
      () => setGeoError(true),
      { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [guiding]);

  useEffect(() => {
    if (guiding) return;
    announced.current.clear();
    spoken.current = { slug: "", kind: "", street: "", band: Infinity };
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setVoiceLine("");
    stopSpeaking();
  }, [guiding]);

  useEffect(() => {
    if (!guiding || !atStop || !nextSite) return;
    if (announced.current.has(nextSite.slug)) return;
    announced.current.add(nextSite.slug);
    const name = pick(nextSite.officialName, locale);
    const explain = pick(nextSite.summary, locale);
    const line = lastStop
      ? t("guideSpeakDone", { name, explain })
      : t("guideSpeakArrive", { name, explain });
    setVoiceLine(line);
    speak(line, locale);
    if (lastStop) return;
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      setNextIndex((index) => index + 1);
    }, 9000);
  }, [atStop, guiding, lastStop, locale, nextSite, t]);

  useEffect(() => {
    if (!guiding || atStop) return;
    if (geoError) {
      if (spoken.current.slug === "denied") return;
      spoken.current = { slug: "denied", kind: "", street: "", band: Infinity };
      const line = t("guideDenied");
      setVoiceLine(line);
      speak(line, locale);
      return;
    }
    if (!user || !nextSite) {
      if (spoken.current.slug === "waiting") return;
      spoken.current = { slug: "waiting", kind: "", street: "", band: Infinity };
      const line = t("guideWaiting");
      setVoiceLine(line);
      speak(line, locale);
      return;
    }
    const step = guidePath?.steps.length ? upcomingStep(user, guidePath.steps) : null;
    const kind = step?.kind ?? "straight";
    const street = step?.street ?? "";
    const band = distanceBand(metersToNext ?? 0);
    const prev = spoken.current;
    if (prev.slug === nextSite.slug && prev.kind === kind && prev.street === street && band >= prev.band) return;
    spoken.current = { slug: nextSite.slug, kind, street, band };
    const name = pick(nextSite.officialName, locale);
    const maneuver = t(`guideMan_${kind}`);
    const line = street
      ? t("guideSpeakStep", { maneuver, street, meters: band, name })
      : t("guideSpeakStepPlain", { maneuver, meters: band, name });
    setVoiceLine(line);
    speak(line, locale);
  }, [atStop, geoError, guidePath, guiding, locale, metersToNext, nextSite, t, user]);

  function build(next: AroundThemeChoice, options?: { shuffle?: boolean; startSlug?: string }) {
    const starts = aroundMonumentStarts();
    const randomStart = starts[Math.floor(Math.random() * starts.length)];
    const planned = planItinerary({
      start: { kind: "site", slug: options?.startSlug ?? randomStart ?? "macedonia-square" },
      themeId: next.themeId,
      budget: { mode: "stops", count: 5 },
      shuffle: options?.shuffle,
    });
    setChoice(next);
    setPlan(planned);
    setSelectedStop(planned.stops[0]?.slug ?? null);
    setGuiding(false);
    setUser(null);
    setGeoError(false);
    setNextIndex(0);
    setStep(0);
    setYearError(false);
    setPhase(reduce ? "ready" : "building");
  }

  function makeDefault() {
    build(aroundThemeRandom(), { shuffle: true });
  }

  function makeFromYear() {
    const year = Number(yearText.trim());
    const next = aroundThemeForYear(year);
    if (!next) {
      setYearError(true);
      return;
    }
    build(next, { startSlug: "macedonia-square" });
  }

  function reset() {
    setPhase("idle");
    setPlan(null);
    setChoice(null);
    setSelectedStop(null);
    setGuiding(false);
    setUser(null);
    setGeoError(false);
    setNextIndex(0);
    setStep(0);
    setYearError(false);
  }

  return (
    <div suppressHydrationWarning>
      <MovementMasthead />

      <div id="move" className="mx-auto max-w-[96rem] px-4 py-8 sm:px-5 sm:py-12 lg:px-8 lg:py-16">
        <AnimatePresence mode="wait">
          {phase === "idle" ? (
            <motion.div
              key="idle"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              className="grid overflow-hidden border border-line bg-foam lg:grid-cols-12"
            >
              <div className="flex flex-col justify-between border-b border-line p-5 sm:p-10 lg:col-span-6 lg:border-r lg:border-b-0">
                <button type="button" className="cs-route-btn" onClick={makeDefault}>
                  {t("makeRoute")}
                </button>
              </div>
              <form
                className="p-5 sm:p-10 lg:col-span-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  makeFromYear();
                }}
              >
                <label className="block">
                  <span className="cs-kicker">02 — {t("yearLabel")}</span>
                  <select
                    className="mt-3 h-16 w-full border-b border-ink bg-transparent font-display text-4xl tracking-tight focus:outline-none sm:h-20 sm:text-5xl"
                    value={yearText}
                    onChange={(event) => {
                      setYearText(event.target.value);
                      setYearError(false);
                    }}
                    aria-invalid={yearError}
                  >
                    <option value="">{t("yearPlaceholder")}</option>
                    {documentedAtlasYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-3 text-xs text-ink-soft">{t("yearHint")}</p>
                {yearError ? (
                  <p className="mt-2 text-sm text-copper" role="alert">
                    {t("yearInvalid")}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-ink px-5 text-[0.95rem] font-semibold tracking-wide text-foam shadow-[0_12px_28px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:bg-[#1e293b]"
                >
                  {t("yearSubmit")}
                </button>
              </form>
            </motion.div>
          ) : null}

          {phase === "building" ? (
            <motion.div
              key="building"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              className="bg-ink px-5 py-16 text-foam sm:px-12 sm:py-20"
              aria-live="polite"
            >
              <div className="flex items-center justify-between text-[11px] tracking-[0.22em] text-brass uppercase">
                <span>{t("buildingTitle")}</span>
                <span>0{step + 1} / 0{BUILD_STEPS.length}</span>
              </div>
              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-foam/15">
                <motion.div
                  className="h-full rounded-full bg-cobalt"
                  animate={{ width: `${((step + 1) / BUILD_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={BUILD_STEPS[step]}
                  className="mt-10 font-display text-4xl leading-[0.92] sm:text-7xl"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  {t(`building_${BUILD_STEPS[step]}`)}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : null}

          {phase === "ready" && plan && choice ? (
            <motion.div
              key="ready"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid gap-4 border border-line bg-foam p-5 sm:p-7 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <p className="cs-kicker">{te(themeKey(choice.themeId))}</p>
                  <h2 className="mt-2 font-display text-4xl leading-[0.9] sm:text-7xl">{t("yourRoute")}</h2>
                </div>
                <div className="lg:col-span-5 lg:self-end">
                  <p className="text-sm leading-relaxed text-ink-soft">{pick(choice.note, locale)}</p>
                  <p className="mt-3 text-xs tracking-[0.16em] text-brass uppercase">
                    {te("stopCount", { count: plan.stops.length })}
                    {pathStatus === "loading" ? ` · ${t("drawingStreets")}` : null}
                    {path?.source === "street" && path.minutes && path.meters
                      ? ` · ${te("streetMeters", { minutes: path.minutes, meters: path.meters })}`
                      : null}
                    {path?.source !== "street" && plan.estimatedMinutes
                      ? ` · ${te("planningEstimate", { minutes: plan.estimatedMinutes })}`
                      : null}
                  </p>
                </div>
              </div>

              <div ref={mapRef} className="cs-map-frame h-72 sm:h-96">
                <Atlas
                  markers={routeMarkers}
                  selectedId={guiding ? (nextStop?.slug ?? selectedStop) : selectedStop}
                  onSelect={setSelectedStop}
                  line={(guiding ? guidePath?.positions : null) ?? path?.positions ?? null}
                  user={guiding ? user : null}
                  label={t("yourRoute")}
                  numberedStops={plan.stops.map((stop) => stop.slug)}
                />
              </div>
              {guiding ? (
                <p className="border border-line bg-foam px-4 py-3 text-sm leading-relaxed" aria-live="assertive">
                  {voiceLine || t("guideWaiting")}
                </p>
              ) : null}

              {plan.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-copper">
                  {pick(warning, locale)}
                </p>
              ))}
              <ol className="overflow-hidden border border-line bg-foam">
                {plan.stops.map((stop, index) => {
                  const site = getSite(stop.slug);
                  const place = getPlace(stop.slug);
                  if (!site) return null;
                  const leg = index > 0 ? plan.legs[index - 1] : null;
                  return (
                    <li key={`${stop.slug}-${index}`} className="grid gap-3 border-b border-line px-5 py-6 last:border-b-0 sm:px-7 sm:py-8 lg:grid-cols-12 lg:items-baseline">
                      <p className="font-display text-4xl leading-none text-cobalt sm:text-5xl lg:col-span-2">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <div className="lg:col-span-8">
                        <p className="font-display text-3xl leading-none sm:text-4xl">{pick(site.officialName, locale)}</p>
                        {index === 0 ? (
                          <p className="mt-2 text-sm text-ink-soft">{te("whyStart")}</p>
                        ) : leg ? (
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                            {pick(leg.explanation, locale)}
                          </p>
                        ) : null}
                        {stop.likelyClosedToday && stop.openingNote ? (
                          <p className="mt-2 text-sm text-copper">{pick(stop.openingNote, locale)}</p>
                        ) : null}
                      </div>
                      <div className="lg:col-span-2 lg:text-right">
                        {place ? (
                          <Link href={sitePath(place)} className="cs-btn cs-btn-ghost w-full sm:w-auto">
                            {te("openStory")}
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="cs-btn cs-btn-cobalt flex-1 sm:flex-none"
                  aria-pressed={guiding}
                  onClick={() => {
                    setGuiding((on) => !on);
                    setGeoError(false);
                    setNextIndex(0);
                    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  <Navigation className="size-4" aria-hidden="true" />
                  {guiding ? t("guideOff") : t("guide")}
                </button>
                <button type="button" className="cs-btn cs-btn-ink w-full sm:w-auto" onClick={reset}>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  {t("again")}
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
