"use client";

import dynamic from "next/dynamic";
import { Navigation, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { AtlasMarker } from "@/components/map/explore-map";
import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getPlace, sitePath } from "@/content/places";
import { MovementMasthead } from "@/components/around/movement-masthead";
import { Link } from "@/i18n/navigation";
import { coordinatesOf } from "@/lib/graph/query";
import {
  AROUND_YEAR_MAX,
  AROUND_YEAR_MIN,
  aroundThemeDefault,
  aroundThemeForYear,
  type AroundThemeChoice,
} from "@/lib/itinerary/around-theme";
import { planItinerary, type ItineraryPlan } from "@/lib/itinerary";
import { useWalkingPath } from "@/lib/mapping/use-walking-path";
import { pedestrianNavigation } from "@/lib/mapping/walk";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-paper-2" /> },
);

const BUILD_STEPS = ["gather", "order", "hours", "path", "lock"] as const;

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

  const points = useMemo(() => {
    if (!plan) return null;
    const mapped = plan.stops
      .map((stop) => coordinatesOf(stop.slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    return mapped.length > 1 ? mapped : null;
  }, [plan]);
  const { status: pathStatus, path } = useWalkingPath(points);
  const nav = points ? pedestrianNavigation(points) : { osm: null, google: null };

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

  function build(next: AroundThemeChoice) {
    const planned = planItinerary({
      start: { kind: "site", slug: "macedonia-square" },
      themeId: next.themeId,
      budget: { mode: "stops", count: 5 },
    });
    setChoice(next);
    setPlan(planned);
    setSelectedStop(planned.stops[0]?.slug ?? null);
    setStep(0);
    setYearError(false);
    setPhase(reduce ? "ready" : "building");
  }

  function makeDefault() {
    build(aroundThemeDefault());
  }

  function makeFromYear() {
    const year = Number(yearText.trim());
    const next = aroundThemeForYear(year);
    if (!next) {
      setYearError(true);
      return;
    }
    build(next);
  }

  function reset() {
    setPhase("idle");
    setPlan(null);
    setChoice(null);
    setSelectedStop(null);
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
                <p className="cs-kicker">01 — 41.9957°N · 21.4312°E</p>
                <button
                  type="button"
                  className="mt-6 h-16 w-full bg-cobalt px-5 font-display text-3xl text-foam hover:bg-ink sm:mt-10 sm:h-20 sm:text-4xl"
                  onClick={makeDefault}
                >
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
                  <input
                    className="mt-3 h-16 w-full border-b border-ink bg-transparent px-0 font-display text-5xl tracking-tight focus:outline-none sm:h-20 sm:text-6xl"
                    inputMode="numeric"
                    type="number"
                    min={AROUND_YEAR_MIN}
                    max={AROUND_YEAR_MAX}
                    placeholder={t("yearPlaceholder")}
                    value={yearText}
                    onChange={(event) => {
                      setYearText(event.target.value);
                      setYearError(false);
                    }}
                    aria-invalid={yearError}
                  />
                </label>
                <p className="mt-3 text-xs text-ink-soft">{t("yearHint", { min: AROUND_YEAR_MIN, max: AROUND_YEAR_MAX })}</p>
                {yearError ? (
                  <p className="mt-2 text-sm text-copper" role="alert">
                    {t("yearInvalid", { min: AROUND_YEAR_MIN, max: AROUND_YEAR_MAX })}
                  </p>
                ) : null}
                <button type="submit" className="cs-btn cs-btn-cobalt mt-5 h-12 w-full">
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

              <div className="cs-map-frame h-72 sm:h-96">
                <Atlas
                  markers={routeMarkers}
                  selectedId={selectedStop}
                  onSelect={setSelectedStop}
                  line={path?.positions ?? null}
                  user={null}
                  label={t("yourRoute")}
                  numberedStops={plan.stops.map((stop) => stop.slug)}
                />
              </div>

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
                {nav.osm ? (
                  <a href={nav.osm} className="cs-btn cs-btn-cobalt flex-1 sm:flex-none" target="_blank" rel="noreferrer">
                    <Navigation className="size-4" aria-hidden="true" />
                    {t("osmWalk")}
                  </a>
                ) : null}
                {nav.google ? (
                  <a href={nav.google} className="cs-btn cs-btn-ghost flex-1 sm:flex-none" target="_blank" rel="noreferrer">
                    {t("googleWalk")}
                  </a>
                ) : null}
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
