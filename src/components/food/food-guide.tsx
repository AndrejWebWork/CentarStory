"use client";

import dynamic from "next/dynamic";
import { ArrowDownRight, ArrowLeft, MapPinned, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import type { AtlasMarker } from "@/components/map/explore-map";
import { pick } from "@/content/copy";
import { dishes, districts, restaurantsForDish } from "@/content/food";
import { dishes as dishRecords, venues } from "@/content/knowledge/culinary";
import { getMedia } from "@/content/knowledge/media";
import { Link } from "@/i18n/navigation";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import type { MediaAsset } from "@/content/knowledge/schema";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-paper-2" /> },
);

export function FoodGuide() {
  const t = useTranslations("food");
  const locale = useLocale();
  const mapRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDish, setOpenDish] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<string | null>(null);
  const [scope, setScope] = useState<"all" | "centar" | "nearby">("all");
  const [selected, setSelected] = useState<string | null>(
    venues.find((item) => item.slug === "palas-jr" && item.coordinates)?.slug ??
      venues.find((item) => item.coordinates)?.slug ??
      districts[0]?.slug ??
      null,
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
  const firstKitchen = filteredHouses.find((house) => house.slug === "palas-jr");
  const inCentar = filteredHouses.filter((house) => house.municipality === "centar");
  const nearby = filteredHouses.filter((house) => house.municipality === "nearby" && house.slug !== "palas-jr");
  const opened = filteredDishes.find((dish) => dish.slug === openDish);
  const featured =
    filteredHouses.find((house) => house.slug === selected) ?? firstKitchen ?? filteredHouses[0];

  function showMap() {
    if (firstKitchen) setSelected(firstKitchen.slug);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const hero = filteredDishes.find((dish) => dish.slug === spotlight) ?? filteredDishes[0];
  const heroPhoto = hero?.imageId ? getMedia(hero.imageId) : undefined;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[96rem] px-4 py-5 sm:px-5 lg:px-8 lg:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl leading-none sm:text-4xl">{t("title")}</p>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">{t("todayLede")}</p>
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-foam shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
            aria-label={t("search")}
            aria-expanded={searchOpen}
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
        </div>
        {searchOpen ? (
          <label className="mt-4 flex items-center gap-2 rounded-full bg-foam px-4 py-3">
            <Search className="size-4 shrink-0 text-ink-soft" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
              placeholder={t("searchHint")}
              autoFocus
              aria-label={t("search")}
            />
          </label>
        ) : null}

        {filteredDishes.length === 0 ? (
          <p className="mt-5 text-sm">{t("empty")}</p>
        ) : opened ? (
          <div className="mt-5">
            <DishStory dish={opened} onBack={() => setOpenDish(null)} />
          </div>
        ) : (
          <>
            {hero ? (
              <button
                type="button"
                onClick={() => setOpenDish(hero.slug)}
                className="group relative mt-5 block min-h-[18rem] w-full overflow-hidden rounded-[1.7rem] bg-ink text-left text-foam sm:min-h-[22rem]"
              >
                <DishPhoto
                  image={heroPhoto}
                  alt={heroPhoto ? pick(heroPhoto.caption, locale) : pick(hero.name, locale)}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
                <span className="relative flex min-h-[18rem] flex-col justify-end p-5 sm:min-h-[22rem] sm:p-7">
                  <span className="text-[10px] tracking-[0.18em] text-foam/70 uppercase">{t("today")}</span>
                  <span className="mt-2 font-display text-4xl leading-[0.92] sm:text-6xl">{pick(hero.name, locale)}</span>
                  <span className="mt-3 max-w-md text-sm text-foam/80">{pick(hero.summary, locale)}</span>
                </span>
              </button>
            ) : null}
            <ul className="cs-no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {filteredDishes.map((dish) => {
                const on = hero?.slug === dish.slug;
                return (
                  <li key={dish.slug}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSpotlight(dish.slug)}
                      className={`h-11 rounded-full px-4 text-sm ${on ? "bg-ink text-foam" : "bg-foam text-ink"}`}
                    >
                      {pick(dish.name, locale)}
                    </button>
                  </li>
                );
              })}
            </ul>
            <ul className="mt-4 space-y-3">
              {filteredDishes.filter((dish) => dish.slug !== hero?.slug).map((dish) => {
                const photo = dish.imageId ? getMedia(dish.imageId) : undefined;
                return (
                  <li key={dish.slug}>
                    <article className="flex gap-3 rounded-[1.4rem] bg-foam p-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                      <button
                        type="button"
                        onClick={() => setOpenDish(dish.slug)}
                        className="relative size-[5.4rem] shrink-0 overflow-hidden rounded-2xl bg-paper-2 sm:size-24"
                      >
                        <DishPhoto
                          image={photo}
                          alt={photo ? pick(photo.caption, locale) : pick(dish.name, locale)}
                        />
                      </button>
                      <div className="flex min-w-0 flex-1 flex-col py-1">
                        <h3 className="font-display text-lg leading-tight sm:text-xl">{pick(dish.name, locale)}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">{pick(dish.summary, locale)}</p>
                        <button
                          type="button"
                          onClick={() => setOpenDish(dish.slug)}
                          className="mt-auto w-fit rounded-full bg-ink px-3 py-1.5 text-[10px] tracking-[0.12em] text-foam uppercase"
                        >
                          {t("open")}
                        </button>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <section ref={mapRef} className="relative mt-5 overflow-hidden rounded-[1.6rem]">
          <div className="cs-map-frame h-[22rem] sm:h-[26rem]">
            <Atlas
              markers={markers}
              selectedId={selected}
              onSelect={setSelected}
              line={null}
              user={null}
              label={t("mapLabel")}
            />
          </div>
          <button
            type="button"
            onClick={showMap}
            className="absolute bottom-20 left-1/2 z-10 flex h-11 -translate-x-1/2 items-center rounded-full bg-ink px-5 text-xs tracking-[0.08em] text-foam uppercase shadow-[0_10px_24px_rgba(15,23,42,0.25)] lg:bottom-4"
          >
            {t("mapCta")}
          </button>
        </section>

        {featured ? (
          <article className="-mt-2 rounded-[1.4rem] bg-foam p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-paper text-copper">
                <MapPinned className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] tracking-[0.16em] text-brass uppercase">
                  {featured.slug === "palas-jr" ? t("firstKitchen") : featured.municipality === "nearby" ? t("nearby") : t("inCentar")}
                </p>
                <h2 className="mt-1 font-display text-2xl leading-none">{featured.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                  {pick(featured.summary, locale)}
                </p>
                {!featured.coordinates ? <p className="mt-2 text-xs text-copper">{t("unmapped")}</p> : null}
              </div>
            </div>
            <Link href={`/food/places/${featured.slug}`} className="cs-btn cs-btn-ink mt-4 h-11 w-full rounded-full">
              {t("openHouse")}
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        ) : null}

        <section className="pt-6">
          <div className="cs-no-scrollbar flex gap-2 overflow-x-auto pb-1">
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
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t("mapNote")}</p>
          <ul className="mt-4 space-y-2">
            {[firstKitchen, ...inCentar, ...nearby]
              .filter((house, index, list): house is NonNullable<typeof house> => Boolean(house) && list.indexOf(house) === index)
              .map((restaurant) => (
                <li key={restaurant.slug}>
                  <HouseRow restaurant={restaurant} selected={selected} onSelect={setSelected} />
                </li>
              ))}
          </ul>
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
    <article className={`rounded-[1.2rem] bg-foam px-4 py-4 ${isSelected ? "ring-2 ring-ink/10" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" className="min-w-0 text-left" onClick={() => onSelect(restaurant.slug)}>
          <span className="block font-display text-xl leading-none">{restaurant.name}</span>
          <span className="mt-1 block text-[10px] tracking-[0.16em] text-brass uppercase">
            {t("lastChecked", { date: restaurant.lastChecked })}
          </span>
        </button>
        {restaurant.coordinates ? (
          <button
            type="button"
            onClick={() => onSelect(restaurant.slug)}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-paper"
            aria-label={common("onMap")}
          >
            <MapPinned className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      {restaurant.municipality === "nearby" ? (
        <p className="mt-2 text-[10px] tracking-[0.2em] text-copper uppercase">{t("nearby")}</p>
      ) : null}
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{pick(restaurant.summary, locale)}</p>
      {!restaurant.coordinates ? <p className="mt-2 text-xs text-copper">{t("unmapped")}</p> : null}
      <Link
        href={`/food/places/${restaurant.slug}`}
        className="mt-3 inline-flex items-center gap-1 text-xs tracking-[0.16em] text-copper uppercase"
      >
        <span>{t("openHouse")}</span>
        <ArrowDownRight className="size-3.5" aria-hidden="true" />
      </Link>
    </article>
  );
}

function DishPhoto({ image, alt }: { image?: MediaAsset; alt: string }) {
  if (!image) return <div className="absolute inset-0 bg-paper-2" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mediaSrc(image, 640)}
      srcSet={mediaSrcSet(image)}
      sizes="200px"
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

function DishStory({
  dish,
  onBack,
}: {
  dish: (typeof dishes)[number];
  onBack: () => void;
}) {
  const t = useTranslations("food");
  const locale = useLocale();
  const photo = dish.imageId ? getMedia(dish.imageId) : undefined;
  const record = dishRecords.find((item) => item.slug === dish.slug);
  const houses = restaurantsForDish(dish.slug);

  return (
    <article className="overflow-hidden rounded-[1.5rem] bg-foam shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="relative h-56 bg-ink sm:h-72">
        <DishPhoto image={photo} alt={photo ? pick(photo.caption, locale) : pick(dish.name, locale)} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-foam">
          <p className="text-[10px] tracking-[0.2em] text-brass uppercase">{pick(dish.eyebrow, locale)}</p>
          <h3 className="mt-1 font-display text-3xl leading-none sm:text-4xl">{pick(dish.name, locale)}</h3>
          {record?.nameMk ? <p className="mt-2 text-sm text-foam/75">{record.nameMk}</p> : null}
        </div>
      </div>
      <div className="p-5">
        <button type="button" onClick={onBack} className="cs-btn cs-btn-ghost h-10 rounded-full">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("back")}
        </button>
        <p className="mt-5 font-display text-xl leading-snug sm:text-2xl">{pick(dish.story[0], locale)}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{pick(dish.story[1], locale)}</p>
        <p className="mt-4 text-sm leading-relaxed">{pick(dish.eat, locale)}</p>
        {houses.length ? (
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {houses.map((house) => (
              <li key={house.slug}>
                <Link href={`/food/places/${house.slug}`} className="flex h-12 items-center justify-between">
                  <span className="font-display text-xl">{house.name}</span>
                  <span className="text-[10px] tracking-[0.14em] text-brass uppercase">{t("openHouse")}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-sm">{t("noneServed")}</p>
        )}
        <Link href={`/food/dishes/${dish.slug}`} className="cs-btn cs-btn-ink mt-5 h-11 w-full rounded-full">
          {t("history")}
          <ArrowDownRight className="size-4" aria-hidden="true" />
        </Link>
        {photo ? (
          <p className="mt-4 text-[11px] tracking-[0.08em] text-brass uppercase">
            {photo.credit} · {photo.license}
          </p>
        ) : null}
      </div>
    </article>
  );
}
