"use client";

import dynamic from "next/dynamic";
import { ArrowDownRight, Camera, Crosshair, List, MapPinned, Plus, Search, Undo2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Plate } from "@/components/atlas/plate";
import { CulturalCalendar } from "@/components/events/cultural-calendar";
import { RouteBuilder } from "@/components/explore/route-builder";
import type { AtlasMarker } from "@/components/map/explore-map";
import { Reveal } from "@/components/motion/reveal";
import { pick } from "@/content/copy";
import { districts } from "@/content/food";
import { getWalk, listEvents, walks } from "@/content/journeys";
import { getSite, sites } from "@/content/knowledge/catalog";
import { venues } from "@/content/knowledge/culinary";
import { getMedia } from "@/content/knowledge/media";
import { CENTAR_BBOX, CENTAR_OSM_RELATION, CENTAR_POLYGON } from "@/content/knowledge/polygon";
import { VERIFIED_ON } from "@/content/knowledge/sources";
import { getPlace, institutions, places, sitePath } from "@/content/places";
import { transportLinks } from "@/content/transport";
import type { EventStatus, Place } from "@/content/types";
import type { Locale } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { ATLAS_FILTERS, siteMatchesFilter, type AtlasFilter } from "@/lib/explore/filters";
import { searchAtlas } from "@/lib/explore/search";
import { formatIsoDay } from "@/lib/format";
import { explainLeg, sitesByTheme } from "@/lib/graph/query";
import { ITINERARY_THEMES } from "@/lib/itinerary";
import { useWalkingPath } from "@/lib/mapping/use-walking-path";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-paper-2" />,
  },
);

const BOUNDARY_PATH = (() => {
  const w = CENTAR_BBOX.east - CENTAR_BBOX.west;
  const h = CENTAR_BBOX.north - CENTAR_BBOX.south;
  return `${CENTAR_POLYGON.map(([lng, lat], index) => {
    const x = (((lng - CENTAR_BBOX.west) / w) * 280 + 20).toFixed(1);
    const y = (((CENTAR_BBOX.north - lat) / h) * 200 + 20).toFixed(1);
    return `${index === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ")} Z`;
})();

function themeKey(id: string) {
  return `theme_${id.replace(/[:.-]/g, "_")}`;
}

export function ExploreExperience() {
  return (
    <Suspense fallback={<Status />}>
      <ExploreInner />
    </Suspense>
  );
}

function Status() {
  const t = useTranslations("common");
  return (
    <p className="px-5 py-16 text-sm text-ink-soft" role="status">
      {t("loading")}
    </p>
  );
}

function ExploreInner() {
  const t = useTranslations("explore");
  const nav = useTranslations("nav");
  const common = useTranslations("common");
  const story = useTranslations("story");
  const evidence = useTranslations("evidence");
  const locale = useLocale() as Locale;
  const reduce = useReducedMotion();
  const events = listEvents();
  const search = useSearchParams();
  const initialPlace = search.get("place");
  const [filter, setFilter] = useState<AtlasFilter>(
    search.get("walk")
      ? "walks"
      : districts.some((district) => district.slug === initialPlace)
        ? "food"
        : "all",
  );
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(search.get("place") ?? "stone-bridge");
  const [walkId, setWalkId] = useState<string | null>(search.get("walk"));
  const [routeStops, setRouteStops] = useState<string[] | null>(null);
  const [user, setUser] = useState<{ lat: number; lng: number } | null>(null);
  const [locateNote, setLocateNote] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [areaOnly, setAreaOnly] = useState(false);
  const [bounds, setBounds] = useState<{ west: number; south: number; east: number; north: number } | null>(null);
  const [resetNonce, setResetNonce] = useState(0);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [mobileList, setMobileList] = useState(false);

  const walk = walkId ? getWalk(walkId) : undefined;
  const activeStops = routeStops ?? walk?.stops ?? null;
  const walkPoints = useMemo(
    () =>
      activeStops
        ?.map((slug) => places.find((place) => place.slug === slug))
        .filter((place) => place !== undefined)
        .map((place) => place.coordinates) ?? null,
    [activeStops],
  );
  const walking = useWalkingPath(activeStops ? walkPoints : null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selected) params.set("place", selected);
    else params.delete("place");
    if (walkId) params.set("walk", walkId);
    else params.delete("walk");
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [selected, walkId]);

  const hits = useMemo(() => (query.trim() ? searchAtlas(query, locale) : null), [locale, query]);
  const themedSlugs = useMemo(
    () => (activeTheme ? new Set(sitesByTheme(activeTheme)) : null),
    [activeTheme],
  );

  const markers: AtlasMarker[] = useMemo(() => {
    if (activeStops) {
      return activeStops.flatMap((slug) => {
        const place = places.find((item) => item.slug === slug);
        if (!place) return [];
        return [
          {
            id: place.slug,
            lat: place.coordinates.lat,
            lng: place.coordinates.lng,
            label: pick(place.name, locale),
            tone:
              place.verificationStatus === "candidate"
                ? ("candidate" as const)
                : place.municipality === "nearby"
                  ? ("nearby" as const)
                  : ("site" as const),
          },
        ];
      });
    }
    if (filter === "food") {
      const districtPins: AtlasMarker[] = districts.map((district) => ({
        id: district.slug,
        lat: district.coordinates.lat,
        lng: district.coordinates.lng,
        label: pick(district.name, locale),
        tone: district.municipality === "nearby" ? "nearby" : "kitchen",
      }));
      const venuePins: AtlasMarker[] = venues.flatMap((venue) => {
        if (!venue.coordinates) return [];
        return [
          {
            id: venue.slug,
            lat: venue.coordinates.lat,
            lng: venue.coordinates.lng,
            label: venue.name,
            tone: venue.municipality === "nearby" ? ("nearby" as const) : ("kitchen" as const),
          },
        ];
      });
      return [...districtPins, ...venuePins];
    }
    if (filter === "transport") return [];
    if (filter === "events") {
      const venueSlugs = [...new Set(events.flatMap((event) => event.venues))];
      return venueSlugs.flatMap((slug) => {
        const place = places.find((item) => item.slug === slug);
        if (!place) return [];
        return [
          {
            id: place.slug,
            lat: place.coordinates.lat,
            lng: place.coordinates.lng,
            label: pick(place.name, locale),
            tone: "site" as const,
          },
        ];
      });
    }
    const wanted = new Set(hits && hits.length ? hits.filter((hit) => hit.mapped).map((hit) => hit.slug) : null);
    return sites
      .filter((site) => {
        if (hits) return wanted.has(site.slug);
        if (themedSlugs) return themedSlugs.has(site.slug);
        if (filter === "walks") return true;
        return siteMatchesFilter(site, filter) || filter === "all";
      })
      .filter((site) => {
        if (!areaOnly || !bounds) return true;
        return (
          site.coordinates.lng >= bounds.west &&
          site.coordinates.lng <= bounds.east &&
          site.coordinates.lat >= bounds.south &&
          site.coordinates.lat <= bounds.north
        );
      })
      .map((site) => ({
        id: site.slug,
        lat: site.coordinates.lat,
        lng: site.coordinates.lng,
        label: pick(site.officialName, locale),
        tone:
          site.verificationStatus === "candidate"
            ? ("candidate" as const)
            : site.municipality === "nearby"
              ? ("nearby" as const)
              : ("site" as const),
      }));
  }, [activeStops, areaOnly, bounds, events, filter, hits, locale, themedSlugs]);

  const selectedPlace = places.find((place) => place.slug === selected);
  const selectedDistrict = districts.find((district) => district.slug === selected);
  const selectedVenue = venues.find((venue) => venue.slug === selected);

  function addPlaceToRoute(slug: string) {
    const place = getPlace(slug);
    const seed = routeStops ?? walk?.stops ?? [];
    if (seed.includes(slug)) {
      setBuilderOpen(true);
      return;
    }
    if (seed.length === 0) {
      const next = [slug, ...(place?.related.slice(0, 2) ?? [])];
      setRouteStops(next);
    } else {
      setRouteStops([...seed, slug]);
    }
    setWalkId(null);
  }

  function locate() {
    if (!navigator.geolocation) {
      setLocateNote(t("locateUnsupported"));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUser({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocateNote(t("located"));
        setLocating(false);
      },
      () => {
        setLocateNote(t("locateDenied"));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const unmappedHits = hits?.filter((hit) => !hit.mapped) ?? [];
  const bridgePhoto = getMedia("img-stone-bridge-delso");
  const kalePhoto = getMedia("img-kale-kallerna");
  const portaPhoto = getMedia("img-porta-macedonia");
  const teresaPhoto = getMedia("img-mother-teresa-danielmkd");
  const squarePhoto = getMedia("img-square-from-bridge");

  const strata = useMemo(() => {
    const order = [
      "skopje-fortress",
      "stone-bridge",
      "old-railway-station",
      "contemporary-art",
      "mother-teresa-house",
      "porta-macedonia",
    ];
    return order.flatMap((slug) => {
      const site = getSite(slug);
      const place = getPlace(slug);
      const milestone = site?.milestones[0];
      if (!site || !place || !milestone) return [];
      const img = site.images[0] ? getMedia(site.images[0]) : undefined;
      return [{ site, place, milestone, img }];
    });
  }, []);

  const museumList = useMemo(() => institutions().slice(0, 6), []);

  return (
    <div>
      {/* 01 — EDITORIAL FIRST VIEWPORT (DESKTOP & TABLET; COMPACT MASTHEAD ON PHONE SO MAP IS DOMINANT) */}
      <section className="relative overflow-hidden border-b border-ink bg-ink text-foam">
        <div className="mx-auto grid max-w-[96rem] grid-cols-1 lg:min-h-[calc(100dvh-4.4rem)] lg:grid-cols-12">
          <div className="relative flex flex-col justify-between border-b border-foam/20 p-4 sm:p-8 lg:col-span-7 lg:border-r lg:border-b-0 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foam/20 pb-3 text-[10px] tracking-[0.24em] text-foam/70 uppercase">
              <span>01 — {t("kicker")}</span>
              <span>OSM {CENTAR_OSM_RELATION} · {VERIFIED_ON}</span>
            </div>

            <div className="relative my-5 sm:my-8 lg:my-0">
              <svg
                viewBox="0 0 320 240"
                className="pointer-events-none absolute -top-6 right-0 h-40 w-56 text-foam/15 sm:h-72 sm:w-96"
                aria-hidden="true"
              >
                <motion.path
                  d={BOUNDARY_PATH}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <circle cx="176" cy="112" r="4" className="fill-cobalt" />
              </svg>
              <p className="text-[10px] tracking-[0.26em] text-brass uppercase sm:text-[11px]">
                41.9957°N · 21.4312°E · Vardar Axis
              </p>
              <h1 className="mt-2 font-display text-[clamp(3.1rem,10.5vw,9.2rem)] leading-[0.84] tracking-tight sm:mt-4">
                Centar
                <span className="block pl-[8%] text-brass italic">{t("title")}.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-foam/80 sm:mt-8 sm:text-lg">
                {t("lede")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-foam/20 pt-4 sm:gap-4 sm:pt-6">
              <a
                href="#atlas-canvas"
                className="flex items-center justify-between border border-foam bg-foam px-4 py-3 text-[11px] tracking-[0.18em] text-ink uppercase hover:bg-paper-2 sm:px-5 sm:py-4 sm:text-xs"
              >
                <span>{t("filters")}</span>
                <ArrowDownRight className="size-4" aria-hidden="true" />
              </a>
              <Link
                href="/scan"
                className="flex items-center justify-between border border-cobalt bg-cobalt px-4 py-3 text-[11px] tracking-[0.18em] text-foam uppercase sm:px-5 sm:py-4 sm:text-xs"
              >
                <span>{nav("scan")}</span>
                <Camera className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative hidden flex-col justify-between bg-ink lg:col-span-5 lg:flex">
            {bridgePhoto ? (
              <figure className="relative min-h-[26rem] flex-1 overflow-hidden border-b border-foam/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaSrc(bridgePhoto, 1280)}
                  srcSet={mediaSrcSet(bridgePhoto)}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  alt={pick(bridgePhoto.caption, locale)}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-[11px] text-foam/85">
                  <div>
                    <span className="block tracking-[0.2em] text-brass uppercase">01 / Stone Bridge</span>
                    <span className="mt-1 block max-w-xs text-xs text-foam/80">{pick(bridgePhoto.caption, locale)}</span>
                  </div>
                  <span className="shrink-0 text-[10px] tracking-[0.16em] uppercase">{bridgePhoto.credit}</span>
                </figcaption>
              </figure>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {kalePhoto ? (
                <Link
                  href="/places/skopje-fortress"
                  className="group relative block aspect-[4/3] overflow-hidden border-b border-foam/20 sm:border-r sm:border-b-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaSrc(kalePhoto, 960)}
                    alt={pick(kalePhoto.caption, locale)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink/45" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10px] tracking-[0.2em] text-brass uppercase">06 / Kale</p>
                    <p className="mt-1 font-display text-2xl leading-none text-foam">
                      {pick(getPlace("skopje-fortress")!.name, locale)}
                    </p>
                  </div>
                </Link>
              ) : null}
              {teresaPhoto ? (
                <Link href="/museums/mother-teresa-house" className="group relative block aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaSrc(teresaPhoto, 960)}
                    alt={pick(teresaPhoto.caption, locale)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink/45" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10px] tracking-[0.2em] text-brass uppercase">04 / 2009</p>
                    <p className="mt-1 font-display text-2xl leading-none text-foam">
                      {pick(getPlace("mother-teresa-house")!.name, locale)}
                    </p>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — THE CITY AS AN INTERACTIVE CULTURAL CANVAS */}
      <section id="atlas-canvas" className="border-b border-ink bg-paper">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid border-b border-ink lg:grid-cols-12">
            <div className="border-b border-ink p-4 sm:p-5 lg:col-span-4 lg:border-r lg:border-b-0 lg:p-6">
              <p className="cs-kicker">
                <span className="inline-block h-2 w-2 bg-cobalt" aria-hidden="true" />
                02 — {t("mapLabel")}
              </p>
              <h2 className="mt-2 font-display text-4xl leading-[0.88] sm:text-5xl">{t("filters")}</h2>
            </div>
            <div className="flex flex-col justify-center gap-2 p-3 sm:p-5 lg:col-span-8 lg:p-6">
              <div className="cs-no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                {ATLAS_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={filter === item && !activeTheme}
                    onClick={() => {
                      setFilter(item);
                      setActiveTheme(null);
                      if (item !== "walks") setWalkId(null);
                      if (item !== "walks") setRouteStops(null);
                    }}
                    className={`cs-chip ${filter === item && !activeTheme ? "is-on" : ""}`}
                  >
                    {t(item)}
                  </button>
                ))}
              </div>
              <div className="cs-no-scrollbar flex items-center gap-1.5 overflow-x-auto border-t border-line pt-2">
                <span className="shrink-0 pr-1 text-[10px] tracking-[0.2em] text-brass uppercase">
                  {t("routeTheme")}:
                </span>
                {ITINERARY_THEMES.slice(0, 7).map((theme) => {
                  const isOn = activeTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => {
                        setActiveTheme(isOn ? null : theme.id);
                        setFilter("all");
                        setWalkId(null);
                      }}
                      className={`cs-chip min-h-8 px-2.5 text-[11px] ${isOn ? "is-on" : ""}`}
                    >
                      {t(themeKey(theme.id))}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12">
            <div className="relative border-b border-ink lg:col-span-8 lg:border-r lg:border-b-0">
              <div className="flex flex-wrap items-center gap-2 border-b border-ink bg-foam p-3">
                <label className="relative min-w-[11rem] flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brass"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="cs-field pr-3 pl-10 text-sm"
                  />
                </label>
                <button type="button" onClick={locate} className="cs-btn cs-btn-ghost h-12 px-3">
                  <Crosshair className="size-4" aria-hidden="true" />
                  <span className="max-sm:sr-only">{locating ? t("locating") : t("locate")}</span>
                </button>
                <button
                  type="button"
                  className="cs-btn cs-btn-ink h-12 px-3 lg:hidden"
                  onClick={() => setMobileList((value) => !value)}
                >
                  {mobileList ? <MapPinned className="size-4" /> : <List className="size-4" />}
                  <span>{mobileList ? t("splitMap") : `${t("splitList")} (${markers.length})`}</span>
                </button>
              </div>

              <div className={`relative h-[64vh] min-h-[420px] sm:h-[70vh] lg:h-[76vh] lg:min-h-[560px] ${mobileList ? "max-lg:hidden" : ""}`}>
                <Atlas
                  markers={markers}
                  selectedId={selected}
                  onSelect={setSelected}
                  line={walking.path?.positions ?? null}
                  user={user}
                  label={t("mapLabel")}
                  cluster
                  scrollZoom
                  showBoundary
                  numberedStops={activeStops ?? undefined}
                  onBoundsChange={setBounds}
                  resetNonce={resetNonce}
                />

                {selectedPlace && filter !== "food" ? (
                  <SelectedSpecimen
                    place={selectedPlace}
                    locale={locale}
                    insideLabel={t("insideCentar")}
                    nearbyLabel={t("nearbyOutside")}
                    candidateLabel={evidence("candidate")}
                    confirmedLabel={evidence("confirmed")}
                    openLabel={common("openStory")}
                    addStopLabel={t("addStop")}
                    inRoute={Boolean(activeStops?.includes(selectedPlace.slug))}
                    onAddToRoute={() => addPlaceToRoute(selectedPlace.slug)}
                    onSelectRelated={(slug) => setSelected(slug)}
                    historicalWhyLabel={t("historicalWhy")}
                    practicalWhyLabel={t("practicalWhy")}
                    noPhotograph={story("noPhotograph")}
                  />
                ) : null}
              </div>

              {selectedPlace && filter !== "food" && !mobileList ? (
                <MobileSpecimenSheet
                  place={selectedPlace}
                  locale={locale}
                  insideLabel={t("insideCentar")}
                  nearbyLabel={t("nearbyOutside")}
                  candidateLabel={evidence("candidate")}
                  openLabel={common("openStory")}
                  addStopLabel={t("addStop")}
                  inRoute={Boolean(activeStops?.includes(selectedPlace.slug))}
                  onAddToRoute={() => addPlaceToRoute(selectedPlace.slug)}
                  onSelectRelated={(slug) => setSelected(slug)}
                  historicalWhyLabel={t("historicalWhy")}
                  practicalWhyLabel={t("practicalWhy")}
                />
              ) : null}

              <div className="flex flex-wrap items-center gap-2 border-t border-ink bg-foam px-4 py-3 text-xs">
                <button
                  type="button"
                  aria-pressed={areaOnly}
                  className={`cs-chip h-9 ${areaOnly ? "is-on" : ""}`}
                  onClick={() => setAreaOnly(true)}
                >
                  {t("searchThisArea")}
                </button>
                <button
                  type="button"
                  className="cs-chip h-9"
                  onClick={() => {
                    setAreaOnly(false);
                    setActiveTheme(null);
                    setQuery("");
                    setResetNonce((value) => value + 1);
                  }}
                >
                  <Undo2 className="size-3.5" aria-hidden="true" />
                  {t("resetArea")}
                </button>
                <p className="text-ink-soft" aria-live="polite">
                  {locateNote}
                  {walking.status === "loading" ? ` ${t("routeLoading")}` : ""}
                  {walking.path?.source === "street" && walking.path.minutes
                    ? ` ${t("routeStreet", { minutes: walking.path.minutes })}`
                    : ""}
                  {walking.path?.source === "direct" ? ` ${t("routeDirect")}` : ""}
                </p>
              </div>
            </div>

            <aside
              className={`bg-foam lg:col-span-4 ${
                mobileList ? "p-4 sm:p-5" : "max-lg:hidden"
              } lg:max-h-[calc(76vh+6.5rem)] lg:overflow-y-auto lg:p-6`}
            >
              <div className="flex gap-2 border-b border-ink pb-4">
                <button
                  type="button"
                  className="cs-btn cs-btn-copper h-11 flex-1"
                  onClick={() => setBuilderOpen((value) => !value)}
                >
                  {builderOpen ? t("closeBuilder") : t("buildRoute")}
                </button>
                {walk || routeStops ? (
                  <button
                    type="button"
                    className="h-11 px-3 text-xs tracking-[0.14em] text-copper uppercase underline"
                    onClick={() => {
                      setWalkId(null);
                      setRouteStops(null);
                    }}
                  >
                    {t("clearWalk")}
                  </button>
                ) : null}
              </div>

              {builderOpen ? (
                <div className="mt-4">
                  <RouteBuilder
                    selectedSlug={selected}
                    user={user}
                    path={walking.path}
                    pathStatus={walking.status}
                    onApply={(next) => {
                      setRouteStops(next);
                      setWalkId(null);
                      setSelected(next[0] ?? null);
                      setFilter("walks");
                    }}
                    onClear={() => setRouteStops(null)}
                  />
                </div>
              ) : null}

              {selectedDistrict && !selectedPlace ? (
                <article className="mt-4 border border-ink bg-paper p-4">
                  <p className="text-[10px] tracking-[0.2em] text-copper uppercase">
                    {selectedDistrict.municipality === "nearby" ? t("nearbyOutside") : t("insideCentar")}
                  </p>
                  <h3 className="mt-2 font-display text-3xl leading-none">{pick(selectedDistrict.name, locale)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(selectedDistrict.approach, locale)}</p>
                  <Link href="/food" className="mt-4 inline-flex h-10 items-center text-xs tracking-[0.16em] text-copper uppercase">
                    {common("openStory")}
                  </Link>
                </article>
              ) : null}

              {selectedVenue && !selectedPlace ? (
                <article className="mt-4 border border-ink bg-paper p-4">
                  {selectedVenue.municipality === "nearby" ? (
                    <p className="text-[10px] tracking-[0.2em] text-copper uppercase">{t("nearbyOutside")}</p>
                  ) : null}
                  <h3 className="mt-2 font-display text-3xl leading-none">{selectedVenue.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(selectedVenue.summary, locale)}</p>
                  {!selectedVenue.coordinates ? <p className="mt-2 text-sm text-copper">{t("destanUnmapped")}</p> : null}
                  <Link
                    href={`/food/places/${selectedVenue.slug}`}
                    className="mt-4 inline-flex h-10 items-center text-xs tracking-[0.16em] text-copper uppercase"
                  >
                    {common("openStory")}
                  </Link>
                </article>
              ) : null}

              <div className="mt-4">
                {filter === "transport" ? (
                  <div className="py-4 text-sm leading-relaxed text-ink-soft">
                    <p>{t("transportNote")}</p>
                    <Link href="/around" className="mt-3 inline-flex h-11 items-center text-copper">
                      {t("transportLink")}
                    </Link>
                    <p className="mt-3">
                      <a href={transportLinks.planner} className="text-copper underline" target="_blank" rel="noreferrer">
                        JSP
                      </a>
                    </p>
                  </div>
                ) : filter === "events" ? (
                  <EventList locale={locale} onVenue={setSelected} />
                ) : filter === "walks" && !routeStops ? (
                  <WalkList
                    locale={locale}
                    active={walkId}
                    onChoose={(slug) => {
                      setWalkId(slug);
                      setRouteStops(null);
                      setSelected(getWalk(slug)?.stops[0] ?? null);
                    }}
                  />
                ) : filter === "food" ? (
                  <FoodList locale={locale} selected={selected} onSelect={setSelected} />
                ) : (
                  <PlaceList
                    markers={markers}
                    locale={locale}
                    selected={selected}
                    candidateLabel={evidence("candidate")}
                    onSelect={(id) => {
                      setSelected(id);
                      setMobileList(false);
                    }}
                  />
                )}
              </div>

              {unmappedHits.length ? (
                <div className="mt-4 border border-dashed border-ink p-3">
                  <p className="text-[11px] tracking-[0.16em] text-brass uppercase">{t("unmapped")}</p>
                  <ul className="mt-2 text-sm">
                    {unmappedHits.map((hit) => (
                      <li key={hit.id} className="py-1 text-ink-soft">
                        {hit.slug === "destan" ? t("destanUnmapped") : `${hit.kind}: ${hit.slug}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      {/* 03 — HISTORICAL STRATA */}
      <section className="border-b border-ink bg-ink text-foam">
        <div className="mx-auto max-w-[96rem] px-4 py-16 sm:px-5 sm:py-20 lg:px-8 lg:py-28">
          <Reveal className="grid gap-6 border-b border-foam/20 pb-12 lg:grid-cols-12">
            <p className="cs-kicker text-brass lg:col-span-3">03 — {story("timeline")}</p>
            <h2 className="font-display text-5xl leading-[0.88] sm:text-7xl lg:col-span-9">
              6th c. — 2014
            </h2>
          </Reveal>
          <ol className="divide-y divide-foam/20">
            {strata.map(({ site, place, milestone, img }) => (
              <li key={site.slug} className="grid gap-6 py-10 lg:grid-cols-12 lg:items-center">
                <p className="font-display text-6xl leading-none text-brass sm:text-7xl lg:col-span-3">
                  {milestone.date}
                </p>
                <div className="lg:col-span-6">
                  <p className="text-[10px] tracking-[0.22em] text-foam/60 uppercase">
                    {pick(place.eyebrow, locale)} · {site.coordinates.lat.toFixed(4)}°N
                  </p>
                  <h3 className="mt-2 font-display text-4xl leading-none">
                    <Link href={sitePath(place)} className="hover:text-brass">
                      {pick(place.name, locale)}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foam/80">
                    {pick(milestone.label, locale)}
                  </p>
                </div>
                <div className="lg:col-span-3">
                  {img ? (
                    <Link href={sitePath(place)} className="block overflow-hidden border border-foam/25">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaSrc(img, 640)}
                        alt={pick(img.caption, locale)}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={sitePath(place)}
                      className="inline-flex h-11 items-center border border-foam/35 px-4 text-xs tracking-[0.16em] uppercase hover:bg-foam hover:text-ink"
                    >
                      {common("openStory")}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 — WALKS AS ARCHITECTURAL FOLIOS */}
      <section className="border-b border-ink bg-paper-2">
        <div className="mx-auto max-w-[96rem] px-4 py-16 sm:px-5 sm:py-20 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-8">
            <div>
              <p className="cs-kicker">04 — {t("walks")}</p>
              <h2 className="mt-3 font-display text-5xl leading-[0.88] sm:text-7xl">{t("walksTitle")}</h2>
            </div>
            {squarePhoto ? (
              <p className="max-w-sm text-xs text-ink-soft">
                {pick(squarePhoto.caption, locale)} ({squarePhoto.credit})
              </p>
            ) : null}
          </div>

          <div className="divide-y divide-ink">
            {walks.map((item, index) => (
              <article key={item.slug} className="grid gap-6 py-10 lg:grid-cols-12 lg:items-baseline">
                <p className="font-display text-6xl leading-none text-copper lg:col-span-2">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="lg:col-span-5">
                  <h3 className="font-display text-4xl leading-[0.92] sm:text-5xl">{pick(item.name, locale)}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">{pick(item.summary, locale)}</p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-xs leading-relaxed text-ink-soft">{pick(item.duration, locale)}</p>
                  <p className="mt-2 text-[11px] tracking-[0.18em] text-brass uppercase">
                    {t("stopCount", { count: item.stops.length })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:col-span-2 lg:justify-end">
                  <button
                    type="button"
                    className="cs-btn cs-btn-ink"
                    onClick={() => {
                      setFilter("walks");
                      setWalkId(item.slug);
                      setRouteStops(null);
                      setSelected(item.stops[0] ?? null);
                      document.getElementById("atlas-canvas")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {common("onMap")}
                  </button>
                  <Link href={`/routes/${item.slug}`} className="cs-btn cs-btn-ghost">
                    {common("openStory")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — HOUSES OF MEMORY & SCAN */}
      <section className="border-b border-ink bg-paper">
        <div className="mx-auto grid max-w-[96rem] lg:grid-cols-12">
          <div className="border-b border-ink p-4 sm:p-8 lg:col-span-7 lg:border-r lg:border-b-0 lg:p-12">
            <div className="flex items-baseline justify-between gap-4">
              <p className="cs-kicker">05 — {t("museums")}</p>
              <Link href="/museums" className="text-xs tracking-[0.18em] text-cobalt uppercase underline">
                {t("museums")} →
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-ink border-t border-ink">
              {museumList.map((inst, idx) => (
                <li key={inst.slug}>
                  <Link
                    href={sitePath(inst)}
                    className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 py-5 hover:text-cobalt"
                  >
                    <span className="font-display text-xl text-brass">{String(idx + 1).padStart(2, "0")}</span>
                    <div>
                      <span className="block font-display text-3xl leading-none">{pick(inst.name, locale)}</span>
                      <span className="mt-1 block text-xs text-ink-soft">{pick(inst.address, locale)}</span>
                    </div>
                    <ArrowDownRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between bg-ink p-6 text-foam sm:p-8 lg:col-span-5 lg:p-12">
            <div>
              <p className="cs-kicker text-brass">06 — {nav("scan")}</p>
              {portaPhoto ? (
                <figure className="relative mt-6 overflow-hidden border border-foam/25">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaSrc(portaPhoto, 960)}
                    alt={pick(portaPhoto.caption, locale)}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-4 border border-foam/70" aria-hidden="true" />
                </figure>
              ) : null}
            </div>
            <div className="mt-8">
              <Link href="/scan" className="cs-btn cs-btn-cobalt h-14 w-full text-sm">
                <Camera className="size-4" aria-hidden="true" />
                {nav("scan")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — MUNICIPAL & INSTITUTIONAL CALENDAR */}
      <section className="mx-auto max-w-[96rem] px-4 py-16 sm:px-5 sm:py-20 lg:px-8">
        <div className="grid gap-6 border-b border-ink pb-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="cs-kicker">07 — {t("events")}</p>
            <h2 className="mt-3 font-display text-5xl leading-[0.88] sm:text-7xl">{t("eventsTitle")}</h2>
          </div>
          <div className="lg:col-span-5 lg:self-end">
            <p className="max-w-md text-sm leading-relaxed text-ink-soft">{t("eventsNote")}</p>
            <Link href="/events" className="cs-btn cs-btn-cobalt mt-4">
              {nav("events")}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="mt-10">
          <CulturalCalendar />
        </div>
      </section>
    </div>
  );
}

function SelectedSpecimen({
  place,
  locale,
  insideLabel,
  nearbyLabel,
  candidateLabel,
  confirmedLabel,
  openLabel,
  addStopLabel,
  inRoute,
  onAddToRoute,
  onSelectRelated,
  historicalWhyLabel,
  practicalWhyLabel,
  noPhotograph,
}: {
  place: Place;
  locale: string;
  insideLabel: string;
  nearbyLabel: string;
  candidateLabel: string;
  confirmedLabel: string;
  openLabel: string;
  addStopLabel: string;
  inRoute: boolean;
  onAddToRoute: () => void;
  onSelectRelated: (slug: string) => void;
  historicalWhyLabel: string;
  practicalWhyLabel: string;
  noPhotograph: string;
}) {
  const site = getSite(place.slug);
  const image = site?.images[0] ? getMedia(site.images[0]) : undefined;
  const index = String(places.findIndex((item) => item.slug === place.slug) + 1).padStart(2, "0");
  const primaryRelatedSlug = place.related[0];
  const primaryRelated = primaryRelatedSlug ? getPlace(primaryRelatedSlug) : undefined;
  const leg = primaryRelated ? explainLeg(place.slug, primaryRelated.slug) : null;

  return (
    <article
      className="hidden border-t border-ink bg-foam lg:absolute lg:bottom-4 lg:left-4 lg:z-10 lg:block lg:w-[24rem] lg:border lg:shadow-[10px_10px_0_var(--ink)]"
      aria-live="polite"
    >
      {image ? (
        <div className="relative h-36 overflow-hidden border-b border-ink bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaSrc(image, 640)} alt={pick(image.caption, locale)} className="h-full w-full object-cover" />
          <span className="absolute top-2 left-2 bg-ink px-2 py-0.5 text-[10px] tracking-[0.2em] text-foam uppercase">
            {index} · {place.coordinates.lat.toFixed(4)}°N
          </span>
        </div>
      ) : (
        <div className="relative h-32 overflow-hidden border-b border-ink">
          <Plate
            motif={place.motif}
            palette={place.palette}
            index={index}
            title={pick(place.name, locale)}
            eyebrow={noPhotograph}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] tracking-[0.2em] text-copper uppercase">
            {place.municipality === "nearby" ? nearbyLabel : insideLabel}
          </p>
          <span
            className={`text-[10px] tracking-[0.16em] uppercase ${
              place.verificationStatus === "candidate" ? "text-copper" : "text-patina"
            }`}
          >
            {place.verificationStatus === "candidate" ? candidateLabel : confirmedLabel}
          </span>
        </div>
        <h3 className="mt-1 font-display text-3xl leading-none">{pick(place.name, locale)}</h3>
        <p className="mt-1 text-[11px] tracking-[0.14em] text-brass uppercase">
          {pick(site?.historicalPeriod ?? place.era, locale)}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-soft">{pick(place.summary, locale)}</p>

        {primaryRelated && leg ? (
          <div className="mt-2.5 border-t border-line pt-2 text-[11px]">
            <span className={`tracking-[0.14em] uppercase ${leg.historical ? "text-cobalt" : "text-brass"}`}>
              {leg.historical ? historicalWhyLabel : practicalWhyLabel}
            </span>
            <button
              type="button"
              onClick={() => onSelectRelated(primaryRelated.slug)}
              className="mt-0.5 block text-left font-medium text-ink underline hover:text-cobalt"
            >
              → {pick(primaryRelated.name, locale)}
            </button>
          </div>
        ) : null}

        <div className="mt-3 flex gap-2">
          <Link
            href={sitePath(place)}
            className="inline-flex h-10 flex-1 items-center justify-between bg-ink px-3 text-[11px] tracking-[0.18em] text-foam uppercase hover:bg-cobalt"
          >
            <span>{openLabel}</span>
            <ArrowDownRight className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onAddToRoute}
            className={`inline-flex h-10 items-center gap-1 border border-ink px-2.5 text-[10px] tracking-[0.16em] uppercase ${
              inRoute ? "bg-copper text-foam" : "bg-paper text-ink hover:bg-paper-2"
            }`}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span>{addStopLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function MobileSpecimenSheet({
  place,
  locale,
  insideLabel,
  nearbyLabel,
  candidateLabel,
  openLabel,
  addStopLabel,
  inRoute,
  onAddToRoute,
  onSelectRelated,
  historicalWhyLabel,
  practicalWhyLabel,
}: {
  place: Place;
  locale: string;
  insideLabel: string;
  nearbyLabel: string;
  candidateLabel: string;
  openLabel: string;
  addStopLabel: string;
  inRoute: boolean;
  onAddToRoute: () => void;
  onSelectRelated: (slug: string) => void;
  historicalWhyLabel: string;
  practicalWhyLabel: string;
}) {
  const site = getSite(place.slug);
  const image = site?.images[0] ? getMedia(site.images[0]) : undefined;
  const index = String(places.findIndex((item) => item.slug === place.slug) + 1).padStart(2, "0");
  const primaryRelatedSlug = place.related[0];
  const primaryRelated = primaryRelatedSlug ? getPlace(primaryRelatedSlug) : undefined;
  const leg = primaryRelated ? explainLeg(place.slug, primaryRelated.slug) : null;

  return (
    <article className="grid grid-cols-[5.5rem_1fr] border-t border-ink bg-ink text-foam lg:hidden" aria-live="polite">
      <div
        className="relative min-h-[7.5rem] border-r border-foam/20 bg-paper-2"
        style={{ background: `linear-gradient(155deg, ${place.palette[0]}, ${place.palette[1]})` }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaSrc(image, 640)} alt={pick(image.caption, locale)} className="h-full w-full object-cover" />
        ) : (
          <span className="absolute bottom-2 left-2 font-display text-3xl leading-none text-foam/40">{index}</span>
        )}
      </div>
      <div className="flex flex-col justify-between p-3.5">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-brass uppercase">
            {index} · {place.municipality === "nearby" ? nearbyLabel : insideLabel}
            {place.verificationStatus === "candidate" ? ` · ${candidateLabel}` : ""}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-none">{pick(place.name, locale)}</h3>
          <p className="mt-1 text-[10px] tracking-[0.14em] text-foam/65 uppercase">
            {pick(site?.historicalPeriod ?? place.era, locale)}
          </p>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-foam/80">{pick(place.summary, locale)}</p>
          {primaryRelated && leg ? (
            <button
              type="button"
              onClick={() => onSelectRelated(primaryRelated.slug)}
              className="mt-1.5 block text-left text-[11px] text-brass underline"
            >
              {leg.historical ? historicalWhyLabel : practicalWhyLabel}: {pick(primaryRelated.name, locale)}
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href={sitePath(place)}
            className="inline-flex h-10 flex-1 items-center justify-between bg-cobalt px-3 text-[11px] tracking-[0.18em] text-foam uppercase"
          >
            <span>{openLabel}</span>
            <ArrowDownRight className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={onAddToRoute}
            className={`inline-flex h-10 items-center gap-1 border border-foam/40 px-2.5 text-[10px] tracking-[0.14em] uppercase ${
              inRoute ? "bg-copper text-foam" : "text-foam"
            }`}
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span>{addStopLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function eventStatusLabel(
  t: ReturnType<typeof useTranslations<"explore">>,
  locale: string,
  status: EventStatus,
  nextDate?: string,
) {
  if (status === "upcoming") {
    return nextDate ? t("eventStatusUpcoming", { date: formatIsoDay(nextDate, locale) }) : t("eventConfirm");
  }
  if (status === "ongoing") return t("eventStatusOngoing");
  if (status === "past") return t("eventStatusPast");
  return t("eventConfirm");
}

function PlaceList({
  markers,
  locale,
  selected,
  candidateLabel,
  onSelect,
}: {
  markers: AtlasMarker[];
  locale: string;
  selected: string | null;
  candidateLabel: string;
  onSelect: (id: string) => void;
}) {
  const common = useTranslations("common");
  if (markers.length === 0) {
    return <p className="py-6 text-sm text-ink-soft">{common("empty")}</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {markers.map((marker, index) => {
        const place = places.find((item) => item.slug === marker.id);
        if (!place) return null;
        const isSelected = selected === marker.id;
        return (
          <li key={marker.id}>
            <button
              type="button"
              onClick={() => onSelect(marker.id)}
              className={`flex w-full items-baseline gap-3 py-3.5 text-left ${isSelected ? "text-cobalt" : ""}`}
            >
              <span className="w-7 font-display text-base text-brass">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl leading-none">{pick(place.name, locale)}</span>
                <span className="mt-1 block text-xs text-ink-soft">
                  {place.municipality === "nearby" ? `${common("nearby")} · ` : ""}
                  {place.verificationStatus === "candidate" ? `${candidateLabel} · ` : ""}
                  {pick(place.eyebrow, locale)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function FoodList({
  locale,
  selected,
  onSelect,
}: {
  locale: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("explore");
  return (
    <ul className="divide-y divide-line">
      {districts.map((district) => (
        <li key={district.slug}>
          <button
            type="button"
            onClick={() => onSelect(district.slug)}
            className={`w-full py-3.5 text-left ${selected === district.slug ? "text-cobalt" : ""}`}
          >
            <span className="block font-display text-2xl">{pick(district.name, locale)}</span>
            <span className="mt-1 block text-xs text-ink-soft">{pick(district.summary, locale)}</span>
          </button>
        </li>
      ))}
      {venues.map((venue) => (
        <li key={venue.slug}>
          <button
            type="button"
            onClick={() => onSelect(venue.slug)}
            className={`w-full py-3.5 text-left ${selected === venue.slug ? "text-cobalt" : ""}`}
          >
            <span className="block font-display text-2xl">{venue.name}</span>
            <span className="mt-1 block text-xs text-ink-soft">
              {venue.coordinates ? pick(venue.summary, locale) : t("destanUnmapped")}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function WalkList({
  locale,
  active,
  onChoose,
}: {
  locale: string;
  active: string | null;
  onChoose: (slug: string) => void;
}) {
  return (
    <ul className="divide-y divide-line">
      {walks.map((walk) => (
        <li key={walk.slug}>
          <button
            type="button"
            onClick={() => onChoose(walk.slug)}
            className={`w-full py-3.5 text-left ${active === walk.slug ? "text-cobalt" : ""}`}
          >
            <span className="block font-display text-2xl">{pick(walk.name, locale)}</span>
            <span className="mt-1 block text-xs text-ink-soft">{pick(walk.summary, locale)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function EventList({ locale, onVenue }: { locale: string; onVenue: (slug: string) => void }) {
  const t = useTranslations("explore");
  const common = useTranslations("common");
  const events = listEvents();
  return (
    <ul className="divide-y divide-line">
      {events.map((event) => (
        <li key={event.slug} className="py-3.5">
          <p className="text-xs text-brass">{eventStatusLabel(t, locale, event.status, event.nextDate)}</p>
          <Link href={`/events/${event.slug}`} className="font-display text-2xl">
            {pick(event.name, locale)}
          </Link>
          {event.venues[0] ? (
            <button type="button" className="mt-2 block text-xs text-copper uppercase" onClick={() => onVenue(event.venues[0])}>
              {common("onMap")}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
