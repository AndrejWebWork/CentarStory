"use client";

import dynamic from "next/dynamic";
import { ArrowDownRight, MapPinned } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { AtlasMarker } from "@/components/map/explore-map";
import { pick } from "@/content/copy";
import { dishes, districts } from "@/content/food";
import { dishes as dishRecords, venues } from "@/content/knowledge/culinary";
import { Link } from "@/i18n/navigation";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-paper-2" /> },
);

export function FoodGuide() {
  const t = useTranslations("food");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "centar" | "nearby">("all");
  const [selected, setSelected] = useState<string | null>(
    venues.find((item) => item.coordinates)?.slug ?? districts[0]?.slug ?? null,
  );
  const markers: AtlasMarker[] = useMemo(
    () => [
      ...districts.map((district) => ({
        id: district.slug,
        lat: district.coordinates.lat,
        lng: district.coordinates.lng,
        label: pick(district.name, locale),
        tone: district.municipality === "nearby" ? ("nearby" as const) : ("kitchen" as const),
      })),
      ...venues.flatMap((house) =>
        house.coordinates
          ? [
              {
                id: house.slug,
                lat: house.coordinates.lat,
                lng: house.coordinates.lng,
                label: house.name,
                tone: house.municipality === "nearby" ? ("nearby" as const) : ("kitchen" as const),
              },
            ]
          : [],
      ),
    ],
    [locale],
  );
  const needle = query.trim().toLowerCase();
  const filteredHouses = venues.filter((house) => {
    if (scope !== "all" && house.municipality !== scope) return false;
    if (!needle) return true;
    const served = house.serves
      .map((slug) => dishes.find((dish) => dish.slug === slug))
      .map((dish) => (dish ? pick(dish.name, locale) : ""))
      .join(" ");
    return `${house.name} ${pick(house.summary, locale)} ${served}`.toLowerCase().includes(needle);
  });
  const filteredDishes = dishes.filter((dish) => {
    if (!needle) return true;
    return `${pick(dish.name, locale)} ${pick(dish.summary, locale)} ${pick(dish.eyebrow, locale)}`
      .toLowerCase()
      .includes(needle);
  });
  const inCentar = filteredHouses.filter((house) => house.municipality === "centar");
  const nearby = filteredHouses.filter((house) => house.municipality === "nearby");

  return (
    <div>
      {/* TERRACOTTA CULINARY FOLIO HEADER */}
      <header className="relative overflow-hidden border-b border-ink bg-copper text-foam">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-3 select-none font-display text-[7.5rem] leading-none text-foam/[0.09] sm:text-[15rem]"
        >
          04
        </span>
        <div className="relative mx-auto grid max-w-[96rem] gap-5 px-4 py-9 sm:px-5 sm:py-14 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-8">
            <p className="cs-kicker text-foam/80">
              <span className="inline-block h-2 w-2 bg-paper" aria-hidden="true" />
              04 — {t("kicker")}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.85rem,11vw,6.2rem)] leading-[0.86] tracking-tight">
              {t("title")}
            </h1>
          </div>
          <div className="border-t border-foam/25 pt-4 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-2 lg:pl-7">
            <p className="text-sm leading-relaxed text-foam/85 sm:text-base">{t("lede")}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[96rem]">
        {/* SEARCH + TABLE NOTES */}
        <div className="grid border-b border-ink bg-paper-2 lg:grid-cols-12">
          <div className="border-b border-ink p-4 sm:p-6 lg:col-span-6 lg:border-r lg:border-b-0">
            <label className="block">
              <span className="cs-kicker">{t("search")}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="cs-field mt-2"
                placeholder={t("searchHint")}
              />
            </label>
            <div className="cs-no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {(["all", "centar", "nearby"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={scope === item}
                  onClick={() => setScope(item)}
                  className={`cs-chip ${scope === item ? "is-on" : ""}`}
                >
                  {t(`scope.${item}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center p-4 sm:p-6 lg:col-span-6">
            <p className="text-xs leading-relaxed text-ink-soft sm:text-sm">{t("inventoryNote")}</p>
            <p className="mt-2 border-l-2 border-copper pl-3 text-xs leading-relaxed text-ink-soft">
              {t("priceCoverage")}
            </p>
          </div>
        </div>

        {/* DISHES AS NUMBERED BROADSHEET SPECIMENS */}
        <section className="px-4 py-12 sm:px-5 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between border-b border-ink pb-4">
            <h2 className="font-display text-4xl sm:text-6xl">{t("dishes")}</h2>
            <span className="text-[11px] tracking-[0.2em] text-brass uppercase">01 — 0{filteredDishes.length}</span>
          </div>
          {filteredDishes.length === 0 ? (
            <p className="mt-6 text-sm">{t("empty")}</p>
          ) : (
            <ol className="divide-y divide-ink border-b border-ink">
              {filteredDishes.map((dish, index) => {
                const record = dishRecords.find((item) => item.slug === dish.slug);
                return (
                  <li key={dish.slug}>
                    <Link
                      href={`/food/dishes/${dish.slug}`}
                      className="group grid gap-3 py-6 sm:py-8 lg:grid-cols-12 lg:items-baseline"
                    >
                      <div className="flex items-baseline justify-between lg:col-span-2">
                        <span className="font-display text-4xl leading-none text-copper sm:text-5xl">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="h-3 w-10 border border-ink lg:hidden"
                          style={{ background: `linear-gradient(90deg, ${dish.palette[0]}, ${dish.palette[1]})` }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="lg:col-span-5">
                        <span className="block text-[10px] tracking-[0.22em] text-brass uppercase">
                          {pick(dish.eyebrow, locale)}
                        </span>
                        <span className="mt-1.5 block font-display text-4xl leading-[0.9] group-hover:text-copper sm:text-5xl">
                          {pick(dish.name, locale)}
                        </span>
                        {record?.nameMk ? (
                          <span className="mt-1 block text-xs text-ink-soft">{record.nameMk}</span>
                        ) : null}
                      </div>
                      <span className="max-w-xl text-sm leading-relaxed text-ink-soft lg:col-span-4">
                        {pick(dish.summary, locale)}
                      </span>
                      <span className="hidden lg:col-span-1 lg:block lg:justify-self-end">
                        <ArrowDownRight className="size-5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* KITCHENS + MAP */}
        <section className="border-t border-ink bg-foam">
          <div className="grid lg:grid-cols-12">
            <div className="border-b border-ink p-4 sm:p-8 lg:col-span-7 lg:border-r lg:border-b-0 lg:p-12">
              <h2 className="font-display text-4xl sm:text-5xl">{t("kitchens")}</h2>
              <h3 className="mt-6 cs-kicker">{t("inCentar")}</h3>
              {inCentar.length === 0 ? (
                <p className="mt-3 text-sm">{t("empty")}</p>
              ) : (
                <ul className="mt-3 divide-y divide-ink border-y border-ink">
                  {inCentar.map((restaurant) => (
                    <li key={restaurant.slug}>
                      <HouseRow restaurant={restaurant} selected={selected} onSelect={setSelected} />
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="mt-8 cs-kicker text-copper">{t("nearby")}</h3>
              {nearby.length === 0 ? (
                <p className="mt-3 text-sm">{t("empty")}</p>
              ) : (
                <ul className="mt-3 divide-y divide-ink border-y border-ink">
                  {nearby.map((restaurant) => (
                    <li key={restaurant.slug}>
                      <HouseRow restaurant={restaurant} selected={selected} onSelect={setSelected} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col lg:col-span-5">
              <div className="h-72 sm:h-96 lg:flex-1 border-b border-ink">
                <Atlas
                  markers={markers}
                  selectedId={selected}
                  onSelect={setSelected}
                  line={null}
                  user={null}
                  label={t("mapLabel")}
                />
              </div>
              <p className="p-4 text-xs leading-relaxed text-ink-soft sm:p-6">{t("mapNote")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HouseRow({
  restaurant,
  selected,
  onSelect,
}: {
  restaurant: (typeof venues)[number];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const t = useTranslations("food");
  const common = useTranslations("common");
  const locale = useLocale();
  const isSelected = selected === restaurant.slug;
  return (
    <article className={`py-5 ${isSelected ? "bg-paper px-3" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <button type="button" className="text-left" onClick={() => onSelect(restaurant.slug)}>
            <span className="block font-display text-3xl leading-none sm:text-4xl">{restaurant.name}</span>
          </button>
          <span className="mt-1 block text-[10px] tracking-[0.16em] text-brass uppercase">
            {t("lastChecked", { date: restaurant.lastChecked })}
          </span>
        </div>
        {restaurant.coordinates ? (
          <button
            type="button"
            onClick={() => onSelect(restaurant.slug)}
            className="grid size-11 shrink-0 place-items-center border border-ink bg-paper"
            aria-label={common("onMap")}
          >
            <MapPinned className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {restaurant.municipality === "nearby" ? (
        <p className="mt-2 text-[10px] tracking-[0.2em] text-copper uppercase">{t("nearby")}</p>
      ) : null}
      <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-soft">{pick(restaurant.summary, locale)}</p>
      {!restaurant.coordinates ? <p className="mt-2 text-xs text-copper">{t("unmapped")}</p> : null}
      <Link
        href={`/food/places/${restaurant.slug}`}
        className="mt-3 inline-flex h-10 items-center gap-1.5 text-xs tracking-[0.16em] text-copper uppercase underline"
      >
        <span>{t("openHouse")}</span>
        <ArrowDownRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}
