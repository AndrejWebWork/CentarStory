"use client";

import dynamic from "next/dynamic";
import { Crosshair, List, MapPinned, Search, Undo2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CulturalCalendar } from "@/components/events/cultural-calendar";
import { RouteBuilder } from "@/components/explore/route-builder";
import type { AtlasMarker } from "@/components/map/explore-map";
import { Reveal } from "@/components/motion/reveal";
import { pick } from "@/content/copy";
import type { EventStatus } from "@/content/types";
import { formatIsoDay } from "@/lib/format";
import { districts } from "@/content/food";
import { getWalk, listEvents, walks } from "@/content/journeys";
import { sites } from "@/content/knowledge/catalog";
import { venues } from "@/content/knowledge/culinary";
import { places, sitePath } from "@/content/places";
import { transportLinks } from "@/content/transport";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { ATLAS_FILTERS, siteMatchesFilter, type AtlasFilter } from "@/lib/explore/filters";
import { searchAtlas } from "@/lib/explore/search";
import { useWalkingPath } from "@/lib/mapping/use-walking-path";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-paper-2" />,
  },
);

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
  const common = useTranslations("common");
  const locale = useLocale() as Locale;
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
  const [selected, setSelected] = useState<string | null>(search.get("place"));
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
            tone: place.municipality === "nearby" ? ("nearby" as const) : ("site" as const),
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
        tone: site.municipality === "nearby" ? ("nearby" as const) : ("site" as const),
      }));
  }, [activeStops, areaOnly, bounds, events, filter, hits, locale]);

  const selectedPlace = places.find((place) => place.slug === selected);
  const selectedDistrict = districts.find((district) => district.slug === selected);
  const selectedVenue = venues.find((venue) => venue.slug === selected);

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

  return (
    <div>
      <Reveal>
        <header className="mx-auto grid max-w-[88rem] gap-6 px-5 pt-8 pb-4 lg:grid-cols-12 lg:px-8 lg:pt-10">
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase lg:col-span-12">01 — {t("kicker")}</p>
          <h1 className="font-display text-5xl leading-[0.92] tracking-tight sm:text-7xl lg:col-span-7">
            {t("title")}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-ink-soft lg:col-span-4 lg:col-start-9 lg:pt-6">
            {t("lede")}
          </p>
        </header>
      </Reveal>
      <div className="mx-auto grid max-w-[88rem] gap-0 px-0 pb-8 lg:grid-cols-12 lg:gap-6 lg:px-8">
        <div className="relative overflow-hidden border-y border-line lg:col-span-8 lg:border">
          <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap items-center gap-2 p-3">
            <label className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-brass" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-12 w-full border border-line bg-foam/95 pr-3 pl-10 text-sm"
              />
            </label>
            <button type="button" onClick={locate} className="inline-flex h-12 items-center gap-2 border border-line bg-foam/95 px-3 text-xs">
              <Crosshair className="size-4" aria-hidden="true" />
              {locating ? t("locating") : t("locate")}
            </button>
            <button type="button" className="inline-flex h-12 items-center gap-2 border border-line bg-foam/95 px-3 text-xs lg:hidden" onClick={() => setMobileList((value) => !value)}>
              {mobileList ? <MapPinned className="size-4" /> : <List className="size-4" />}
              {mobileList ? t("splitMap") : t("splitList")}
            </button>
          </div>
          <div className={`h-[78vh] min-h-[520px] ${mobileList ? "max-lg:hidden" : ""}`}>
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
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-foam px-3 py-2 text-xs">
            <button type="button" className="h-10 border border-line px-3" onClick={() => setAreaOnly(true)}>
              {t("searchThisArea")}
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-1 border border-line px-3"
              onClick={() => {
                setAreaOnly(false);
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
              {walking.path?.source === "street" && walking.path.minutes ? ` ${t("routeStreet", { minutes: walking.path.minutes })}` : ""}
              {walking.path?.source === "direct" ? ` ${t("routeDirect")}` : ""}
            </p>
          </div>
        </div>
        <aside className={`border-line bg-foam px-5 py-5 lg:col-span-4 lg:border ${mobileList ? "" : "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-20 max-lg:max-h-[46vh] max-lg:overflow-auto max-lg:border-t"}`}>
          <fieldset>
            <legend className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("filters")}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {ATLAS_FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={filter === item}
                  onClick={() => {
                    setFilter(item);
                    if (item !== "walks") setWalkId(null);
                    if (item !== "walks") setRouteStops(null);
                  }}
                  className={`h-11 border px-3 text-sm ${filter === item ? "border-ink bg-ink text-foam" : "border-line bg-foam"}`}
                >
                  {t(item)}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 flex gap-2">
            <button type="button" className="h-11 flex-1 bg-copper text-foam text-sm" onClick={() => setBuilderOpen((value) => !value)}>
              {builderOpen ? t("closeBuilder") : t("buildRoute")}
            </button>
            {walk || routeStops ? (
              <button
                type="button"
                className="h-11 px-3 text-sm text-copper underline"
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
          <div className="mt-6 border-t border-line">
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
              <PlaceList markers={markers} locale={locale} selected={selected} onSelect={setSelected} />
            )}
          </div>
          {unmappedHits.length ? (
            <div className="mt-4 border border-dashed border-line p-3">
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
          {selectedPlace && filter !== "food" ? (
            <article className="mt-4 border border-line bg-paper p-4 transition-colors" aria-live="polite">
              <p className="text-[11px] tracking-[0.16em] text-brass uppercase">{common("selected")}</p>
              {selectedPlace.municipality === "nearby" ? (
                <p className="mt-2 text-[11px] tracking-[0.16em] text-copper uppercase">{t("nearbyOutside")}</p>
              ) : (
                <p className="mt-2 text-[11px] tracking-[0.16em] text-patina uppercase">{t("insideCentar")}</p>
              )}
              <h2 className="mt-2 font-display text-3xl leading-none">{pick(selectedPlace.name, locale)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(selectedPlace.summary, locale)}</p>
              <Link href={sitePath(selectedPlace)} className="mt-4 inline-flex h-11 items-center text-sm text-copper">
                {common("openStory")}
              </Link>
            </article>
          ) : null}
          {selectedDistrict && !selectedPlace ? (
            <article className="mt-4 border border-line bg-paper p-4">
              {selectedDistrict.municipality === "nearby" ? (
                <p className="text-[11px] tracking-[0.16em] text-copper uppercase">{t("nearbyOutside")}</p>
              ) : (
                <p className="text-[11px] tracking-[0.16em] text-patina uppercase">{t("insideCentar")}</p>
              )}
              <h2 className="mt-2 font-display text-3xl leading-none">{pick(selectedDistrict.name, locale)}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(selectedDistrict.approach, locale)}</p>
              <Link href="/food" className="mt-4 inline-flex h-11 items-center text-sm text-copper">
                {common("openStory")}
              </Link>
            </article>
          ) : null}
          {selectedVenue && !selectedPlace ? (
            <article className="mt-4 border border-line bg-paper p-4">
              {selectedVenue.municipality === "nearby" ? (
                <p className="text-[11px] tracking-[0.16em] text-copper uppercase">{t("nearbyOutside")}</p>
              ) : null}
              <h2 className="mt-2 font-display text-3xl leading-none">{selectedVenue.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(selectedVenue.summary, locale)}</p>
              {!selectedVenue.coordinates ? <p className="mt-2 text-sm text-copper">{t("destanUnmapped")}</p> : null}
              <Link href={`/food/places/${selectedVenue.slug}`} className="mt-4 inline-flex h-11 items-center text-sm text-copper">
                {common("openStory")}
              </Link>
            </article>
          ) : null}
          {!selectedPlace && !selectedDistrict && !selectedVenue ? (
            <p className="mt-4 text-sm text-ink-soft">{t("selectPrompt")}</p>
          ) : null}
        </aside>
      </div>
      <section className="mx-auto max-w-[88rem] px-5 pb-4 lg:px-8">
        <h2 className="font-display text-4xl">{t("walksTitle")}</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {walks.map((item, index) => (
            <article key={item.slug} className="border border-line p-5">
              <p className="text-[11px] tracking-[0.18em] text-brass uppercase">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 font-display text-3xl leading-none">{pick(item.name, locale)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(item.summary, locale)}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <button
                  type="button"
                  className="h-11 text-copper"
                  onClick={() => {
                    setFilter("walks");
                    setWalkId(item.slug);
                    setRouteStops(null);
                    setSelected(item.stops[0] ?? null);
                  }}
                >
                  {common("onMap")}
                </button>
                <Link href={`/routes/${item.slug}`} className="inline-flex h-11 items-center">
                  {common("openStory")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[88rem] px-5 py-10 lg:px-8">
        <h2 className="font-display text-4xl">{t("eventsTitle")}</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{t("eventsNote")}</p>
        <div className="mt-6">
          <CulturalCalendar />
        </div>
      </section>
    </div>
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
  onSelect,
}: {
  markers: AtlasMarker[];
  locale: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const common = useTranslations("common");
  if (markers.length === 0) {
    return <p className="py-6 text-sm text-ink-soft">{common("empty")}</p>;
  }
  return (
    <ul>
      {markers.map((marker, index) => {
        const place = places.find((item) => item.slug === marker.id);
        if (!place) return null;
        return (
          <li key={marker.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => onSelect(marker.id)}
              className={`flex w-full items-baseline gap-4 py-4 text-left ${selected === marker.id ? "text-copper" : ""}`}
            >
              <span className="w-8 font-display text-lg text-brass">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-display text-2xl leading-none">{pick(place.name, locale)}</span>
                <span className="mt-1 block text-sm text-ink-soft">
                  {place.municipality === "nearby" ? `${common("nearby")} · ` : ""}
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
    <ul>
      {districts.map((district) => (
        <li key={district.slug} className="border-b border-line">
          <button
            type="button"
            onClick={() => onSelect(district.slug)}
            className={`w-full py-4 text-left ${selected === district.slug ? "text-copper" : ""}`}
          >
            <span className="block font-display text-2xl">{pick(district.name, locale)}</span>
            <span className="mt-1 block text-sm text-ink-soft">{pick(district.summary, locale)}</span>
          </button>
        </li>
      ))}
      {venues.map((venue) => (
        <li key={venue.slug} className="border-b border-line">
          <button
            type="button"
            onClick={() => onSelect(venue.slug)}
            className={`w-full py-4 text-left ${selected === venue.slug ? "text-copper" : ""}`}
          >
            <span className="block font-display text-2xl">{venue.name}</span>
            <span className="mt-1 block text-sm text-ink-soft">
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
    <ul>
      {walks.map((walk) => (
        <li key={walk.slug} className="border-b border-line">
          <button
            type="button"
            onClick={() => onChoose(walk.slug)}
            className={`w-full py-4 text-left ${active === walk.slug ? "text-copper" : ""}`}
          >
            <span className="block font-display text-2xl">{pick(walk.name, locale)}</span>
            <span className="mt-1 block text-sm text-ink-soft">{pick(walk.summary, locale)}</span>
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
    <ul>
      {events.map((event) => (
        <li key={event.slug} className="border-b border-line py-4">
          <p className="text-sm text-brass">{eventStatusLabel(t, locale, event.status, event.nextDate)}</p>
          <Link href={`/events/${event.slug}`} className="font-display text-2xl">
            {pick(event.name, locale)}
          </Link>
          {event.venues[0] ? (
            <button type="button" className="mt-2 block text-sm text-copper" onClick={() => onVenue(event.venues[0])}>
              {common("onMap")}
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
