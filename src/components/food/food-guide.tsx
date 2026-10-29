"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { AtlasMarker } from "@/components/map/explore-map";
import { pick } from "@/content/copy";
import { dishes, districts } from "@/content/food";
import { venues } from "@/content/knowledge/culinary";
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
      <header className="bg-paper-2">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-7">
            <p className="text-[11px] tracking-[0.22em] text-brass uppercase">04 — {t("kicker")}</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.9] sm:text-7xl">{t("title")}</h1>
          </div>
          <p className="max-w-md leading-relaxed text-ink-soft lg:col-span-4 lg:col-start-9 lg:pt-10">{t("lede")}</p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-soft">{t("inventoryNote")}</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{t("priceCoverage")}</p>
        <label className="mt-8 block">
          <span className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("search")}</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 h-12 w-full border border-line bg-transparent px-3"
            placeholder={t("searchHint")}
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "centar", "nearby"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={scope === item}
              onClick={() => setScope(item)}
              className={`h-11 border px-3 text-sm ${scope === item ? "border-ink bg-ink text-foam" : "border-line"}`}
            >
              {t(`scope.${item}`)}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="h-80 overflow-hidden border border-line lg:col-span-5">
            <Atlas
              markers={markers}
              selectedId={selected}
              onSelect={setSelected}
              line={null}
              user={null}
              label={t("mapLabel")}
            />
          </div>
          <p className="text-sm leading-relaxed text-ink-soft lg:col-span-7 lg:pt-4">{t("mapNote")}</p>
        </div>
        <section className="mt-14">
          <h2 className="font-display text-5xl">{t("dishes")}</h2>
          {filteredDishes.length === 0 ? (
            <p className="mt-4 text-sm">{t("empty")}</p>
          ) : (
            <ul className="mt-6">
              {filteredDishes.map((dish) => (
                <li key={dish.slug} className="border-t border-line py-8">
                  <Link href={`/food/dishes/${dish.slug}`} className="grid gap-4 lg:grid-cols-12">
                    <span
                      className="hidden min-h-28 lg:col-span-3 lg:block"
                      style={{ background: `linear-gradient(160deg, ${dish.palette[0]}, ${dish.palette[1]})` }}
                      aria-hidden="true"
                    />
                    <span className="lg:col-span-9">
                      <span className="text-[11px] tracking-[0.16em] text-brass uppercase">{pick(dish.eyebrow, locale)}</span>
                      <span className="mt-2 block font-display text-4xl leading-none sm:text-5xl">{pick(dish.name, locale)}</span>
                      <span className="mt-4 block max-w-2xl text-sm leading-relaxed text-ink-soft">
                        {pick(dish.summary, locale)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="mt-14">
          <h2 className="font-display text-4xl">{t("kitchens")}</h2>
          <h3 className="mt-8 text-[11px] tracking-[0.18em] text-brass uppercase">{t("inCentar")}</h3>
          {inCentar.length === 0 ? (
            <p className="mt-3 text-sm">{t("empty")}</p>
          ) : (
            <ul className="mt-4 grid gap-4 lg:grid-cols-2">
              {inCentar.map((restaurant) => (
                <li key={restaurant.slug}>
                  <HouseCard restaurant={restaurant} selected={selected} onSelect={setSelected} />
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-10 text-[11px] tracking-[0.18em] text-copper uppercase">{t("nearby")}</h3>
          {nearby.length === 0 ? (
            <p className="mt-3 text-sm">{t("empty")}</p>
          ) : (
            <ul className="mt-4 grid gap-4 lg:grid-cols-2">
              {nearby.map((restaurant) => (
                <li key={restaurant.slug}>
                  <HouseCard restaurant={restaurant} selected={selected} onSelect={setSelected} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function HouseCard({
  restaurant,
  selected,
  onSelect,
}: {
  restaurant: (typeof venues)[number];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const t = useTranslations("food");
  const locale = useLocale();
  return (
    <article className={`border p-5 ${selected === restaurant.slug ? "border-ink" : "border-line"}`}>
      <button type="button" className="text-left" onClick={() => onSelect(restaurant.slug)}>
        <span className="block font-display text-3xl">{restaurant.name}</span>
      </button>
      {restaurant.municipality === "nearby" ? (
        <p className="mt-2 text-[11px] tracking-[0.16em] text-copper uppercase">{t("nearby")}</p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pick(restaurant.summary, locale)}</p>
      {!restaurant.coordinates ? <p className="mt-2 text-sm text-copper">{t("unmapped")}</p> : null}
      <p className="mt-3 text-xs text-brass">{t("lastChecked", { date: restaurant.lastChecked })}</p>
      <Link href={`/food/places/${restaurant.slug}`} className="mt-4 inline-flex h-11 items-center text-sm text-copper">
        {t("openHouse")}
      </Link>
    </article>
  );
}
