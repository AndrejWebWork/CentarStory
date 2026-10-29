"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CulturalCalendar } from "@/components/events/cultural-calendar";
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

const kinds: Array<"all" | InstitutionKind> = ["all", "collection", "memorial", "stage"];

function HoursBadge({ slug }: { slug: string }) {
  const t = useTranslations("museums");
  const locale = useLocale();
  const mounted = useMounted();
  const ops = getVisitOps(slug);
  if (!ops) return <span className="text-xs text-ink-soft">{t("hoursUnverified")}</span>;
  const state = mounted ? openState(ops.windows) : { computed: false, open: null };
  return (
    <span className="text-xs">
      {state.computed ? (
        <span className={state.open ? "text-copper" : "text-ink-soft"}>{state.open ? t("openToday") : t("closedToday")}</span>
      ) : (
        <span className="text-ink-soft">{t("noOpenToday")}</span>
      )}
      <span className="mt-1 block text-ink-soft">{pick(ops.timetable, locale)}</span>
      <span className="mt-1 block text-[11px] tracking-[0.12em] text-brass uppercase">
        {t("verifiedOn", { date: ops.lastChecked })}
      </span>
    </span>
  );
}

function MuseumCard({ place, index }: { place: Place; index: number }) {
  const locale = useLocale();
  const t = useTranslations("museums");
  const site = getSite(place.slug);
  const ops = getVisitOps(place.slug);
  const image = site?.images?.[0] ? getMedia(site.images[0]) : undefined;
  return (
    <article className="overflow-hidden border border-line">
      <Link href={sitePath(place)} className="grid gap-0 lg:grid-cols-12">
        <div
          className="relative min-h-48 lg:col-span-5"
          style={{ background: `linear-gradient(135deg, ${place.palette[0]}, ${place.palette[1]})` }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaSrc(image, 960)}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <p className="absolute right-4 bottom-4 text-[11px] tracking-[0.16em] text-foam uppercase">{t("noPhotograph")}</p>
          )}
        </div>
        <div className="p-5 lg:col-span-7 lg:p-7">
          <p className="text-[11px] tracking-[0.18em] text-brass uppercase">
            {String(index + 1).padStart(2, "0")} · {t(place.institution ?? "collection")}
          </p>
          <h2 className="mt-2 font-display text-4xl leading-none">{pick(place.name, locale)}</h2>
          <p className="mt-3 text-sm text-ink-soft">{pick(place.address, locale)}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {place.collection ? pick(place.collection, locale) : pick(place.summary, locale)}
          </p>
          <div className="mt-4">
            <HoursBadge slug={place.slug} />
          </div>
          {ops?.tickets ? <p className="mt-3 text-sm leading-relaxed">{pick(ops.tickets, locale)}</p> : null}
        </div>
      </Link>
    </article>
  );
}

export function MuseumIndex() {
  const t = useTranslations("museums");
  const locale = useLocale();
  const [kind, setKind] = useState<(typeof kinds)[number]>("all");
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return institutions().filter((place) => {
      if (kind !== "all" && place.institution !== kind) return false;
      if (!needle) return true;
      const blob = `${pick(place.name, locale)} ${pick(place.summary, locale)} ${pick(place.address, locale)}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [kind, locale, query]);

  return (
    <div>
      <header className="relative overflow-hidden bg-ink text-foam">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-12 lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <p className="text-[11px] tracking-[0.22em] text-brass uppercase">03 — {t("kicker")}</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.9] sm:text-7xl">{t("title")}</h1>
          </div>
          <p className="max-w-md text-base leading-relaxed text-foam/80 lg:col-span-4 lg:col-start-9 lg:pt-10">{t("lede")}</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
        <label className="block">
          <span className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("search")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 h-12 w-full border border-line bg-transparent px-3"
            placeholder={t("searchHint")}
          />
        </label>
        <fieldset className="mt-8">
          <legend className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("filters")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {kinds.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={kind === item}
                onClick={() => setKind(item)}
                className={`h-11 border px-3 text-sm ${kind === item ? "border-ink bg-ink text-foam" : "border-line"}`}
              >
                {t(item)}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">{t("inventoryNote")}</p>
        {list.length === 0 ? (
          <p className="mt-8 text-sm">{t("empty")}</p>
        ) : (
          <ol className="mt-8 grid gap-6">
            {list.map((place, index) => (
              <li key={place.slug}>
                <MuseumCard place={place} index={index} />
              </li>
            ))}
          </ol>
        )}
        <section className="mt-16">
          <h2 className="font-display text-4xl">{t("nearbyTitle")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{t("nearbyBody")}</p>
        </section>
        <section className="mt-16">
          <h2 className="font-display text-4xl">{t("exhibitions")}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{t("exhibitionsLede")}</p>
          <div className="mt-6">
            <CulturalCalendar />
          </div>
        </section>
      </div>
    </div>
  );
}
