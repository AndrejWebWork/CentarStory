"use client";

import dynamic from "next/dynamic";
import { ArrowDownRight, CalendarDays, MapPinned } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Plate } from "@/components/atlas/plate";
import { CulturalCalendar } from "@/components/events/cultural-calendar";
import type { AtlasMarker } from "@/components/map/explore-map";
import { pick } from "@/content/copy";
import { getSite } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import { getVisitOps } from "@/content/knowledge/visit-ops";
import { institutions, sitePath } from "@/content/places";
import type { InstitutionKind, Place } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { mediaSrc } from "@/lib/media/src";
import { useMounted } from "@/lib/use-mounted";
import { openState } from "@/lib/visit/hours";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-paper-2" /> },
);

const kinds: Array<"all" | InstitutionKind> = ["all", "collection", "memorial", "stage"];

function HoursBadge({ slug }: { slug: string }) {
  const t = useTranslations("museums");
  const locale = useLocale();
  const mounted = useMounted();
  const ops = getVisitOps(slug);
  if (!ops) return <span className="text-xs text-ink-soft">{t("hoursUnverified")}</span>;
  const state = mounted ? openState(ops.windows) : { computed: false, open: null };
  return (
    <div className="space-y-1 text-xs">
      {state.computed ? (
        <p className={`font-medium ${state.open ? "text-patina" : "text-copper"}`}>
          {state.open ? t("openToday") : t("closedToday")}
        </p>
      ) : (
        <p className="text-ink-soft">{t("noOpenToday")}</p>
      )}
      <p className="text-ink-soft">{pick(ops.timetable, locale)}</p>
      <p className="text-[10px] tracking-[0.18em] text-brass uppercase">
        {t("verifiedOn", { date: ops.lastChecked })}
      </p>
    </div>
  );
}

function MuseumRow({
  place,
  index,
  selected,
  onSelect,
}: {
  place: Place;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("museums");
  const common = useTranslations("common");
  const site = getSite(place.slug);
  const ops = getVisitOps(place.slug);
  const image = site?.images?.[0] ? getMedia(site.images[0]) : undefined;
  const folio = String(index + 1).padStart(2, "0");

  return (
    <article className={`overflow-hidden rounded-[1.5rem] border border-line shadow-[0_12px_30px_rgba(15,23,42,0.05)] ${selected ? "bg-paper-2" : "bg-foam"}`}>
      <div className="grid lg:grid-cols-12">
        <Link
          href={sitePath(place)}
          className="relative block h-48 overflow-hidden sm:h-56 lg:col-span-4 lg:h-auto lg:min-h-60"
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaSrc(image, 960)}
              alt={pick(image.caption, locale)}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <Plate
              motif={place.motif}
              palette={place.palette}
              index={folio}
              title={pick(place.name, locale)}
              eyebrow={t("noPhotograph")}
            />
          )}
          <span className="absolute top-3 left-3 rounded-full bg-patina px-2.5 py-1 text-[10px] tracking-[0.2em] text-foam uppercase">
            {folio} · {t(place.institution ?? "collection")}
          </span>
        </Link>

        <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-8">
          <div>
            <div className="flex items-start justify-between gap-3">
              <Link href={sitePath(place)} className="group">
                <h2 className="font-display text-3xl leading-[0.92] group-hover:text-patina sm:text-5xl">
                  {pick(place.name, locale)}
                </h2>
              </Link>
              <button
                type="button"
                onClick={onSelect}
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-paper text-ink hover:bg-patina hover:text-foam"
                aria-label={common("onMap")}
                title={common("onMap")}
              >
                <MapPinned className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">{pick(place.address, locale)}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {place.collection ? pick(place.collection, locale) : pick(place.summary, locale)}
            </p>
          </div>
          <div className="mt-4 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
            <HoursBadge slug={place.slug} />
            <div className="flex flex-col justify-between gap-2">
              {ops?.tickets ? (
                <p className="text-xs leading-relaxed text-ink-soft">{pick(ops.tickets, locale)}</p>
              ) : null}
              <Link
                href={sitePath(place)}
                className="inline-flex h-10 items-center gap-1.5 text-xs tracking-[0.18em] text-patina uppercase underline"
              >
                <span>{common("openStory")}</span>
                <ArrowDownRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MuseumIndex() {
  const t = useTranslations("museums");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const [kind, setKind] = useState<(typeof kinds)[number]>("all");
  const [query, setQuery] = useState("");
  const allInstitutions = useMemo(() => institutions(), []);
  const [selected, setSelected] = useState<string | null>(allInstitutions[0]?.slug ?? null);

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allInstitutions.filter((place) => {
      if (kind !== "all" && place.institution !== kind) return false;
      if (!needle) return true;
      const blob = `${pick(place.name, locale)} ${pick(place.summary, locale)} ${pick(place.address, locale)}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [allInstitutions, kind, locale, query]);

  const markers: AtlasMarker[] = useMemo(
    () =>
      list.map((place) => ({
        id: place.slug,
        lat: place.coordinates.lat,
        lng: place.coordinates.lng,
        label: pick(place.name, locale),
        tone: "site" as const,
      })),
    [list, locale],
  );

  return (
    <div>
      <header className="relative mx-3 mt-3 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(155deg,#0f9f8a_0%,#0b7d6c_52%,#0f172a_140%)] text-foam sm:mx-4">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-3 select-none font-display text-[7.5rem] leading-none text-foam/[0.08] sm:text-[15rem]"
        >
          03
        </span>
        <div className="relative mx-auto grid max-w-[96rem] gap-5 px-5 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:px-10 lg:py-20">
          <div className="lg:col-span-8">
            <p className="cs-kicker text-foam/75">
              <span className="inline-block size-2 rounded-full bg-paper" aria-hidden="true" />
              03 — {t("kicker")}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.85rem,11vw,6.2rem)] leading-[0.86] tracking-tight">
              {t("title")}
            </h1>
          </div>
          <div className="pt-2 lg:col-span-4 lg:pt-10">
            <p className="text-sm leading-relaxed text-foam/85 sm:text-base">{t("lede")}</p>
            <Link href="/events" className="cs-btn mt-5 w-full bg-foam text-ink sm:w-auto">
              <CalendarDays className="size-4" aria-hidden="true" />
              {nav("events")}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[96rem]">
        {/* STICKY PHONE FILTER BAR + INTERACTIVE QUAY MAP */}
        <div className="mx-3 mt-4 grid overflow-hidden rounded-[1.5rem] border border-line bg-foam shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:mx-4 lg:grid-cols-12">
          <div className="border-b border-line p-4 sm:p-6 lg:col-span-6 lg:border-r lg:border-b-0">
            <label className="block">
              <span className="cs-kicker">{t("search")}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="cs-field mt-2"
                placeholder={t("searchHint")}
              />
            </label>
            <fieldset className="mt-4">
              <legend className="cs-kicker">{t("filters")}</legend>
              <div className="cs-no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
                {kinds.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={kind === item}
                    onClick={() => setKind(item)}
                    className={`cs-chip ${kind === item ? "is-on" : ""}`}
                  >
                    {t(item)}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t("inventoryNote")}</p>
          </div>

          <div className="h-64 sm:h-72 lg:col-span-6 lg:h-auto lg:min-h-[16rem]">
            <Atlas
              markers={markers}
              selectedId={selected}
              onSelect={setSelected}
              line={null}
              user={null}
              label={t("title")}
            />
          </div>
        </div>

        {list.length === 0 ? (
          <p className="px-4 py-12 text-sm lg:px-8">{t("empty")}</p>
        ) : (
          <ol className="mx-3 mt-4 space-y-3 sm:mx-4">
            {list.map((place, index) => (
              <li key={place.slug}>
                <MuseumRow
                  place={place}
                  index={index}
                  selected={selected === place.slug}
                  onSelect={() => setSelected(place.slug)}
                />
              </li>
            ))}
          </ol>
        )}

        <section className="mx-3 mt-4 mb-2 grid overflow-hidden rounded-[1.5rem] border border-line bg-foam shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:mx-4 lg:grid-cols-12">
          <div className="border-b border-line p-5 sm:p-8 lg:col-span-5 lg:border-r lg:border-b-0">
            <h2 className="font-display text-3xl sm:text-4xl">{t("nearbyTitle")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("nearbyBody")}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-8 lg:col-span-7">
            <div>
              <p className="cs-kicker">{nav("events")}</p>
              <h2 className="mt-2 font-display text-3xl leading-none sm:text-4xl">{t("exhibitions")}</h2>
              <p className="mt-2 max-w-xl text-sm text-ink-soft">{t("exhibitionsLede")}</p>
            </div>
            <Link href="/events" className="cs-btn cs-btn-patina">
              {nav("events")}
            </Link>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-5 lg:px-8">
          <CulturalCalendar host="institution" />
        </section>
      </div>
    </div>
  );
}
