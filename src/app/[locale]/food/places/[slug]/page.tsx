import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { pick } from "@/content/copy";
import { getDish, getDistrict, getRestaurant, restaurants } from "@/content/food";
import { MACEDONIA_SQUARE } from "@/content/knowledge/boundary";
import { pedestrianNavigation } from "@/lib/mapping/walk";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
import { resolveLocale } from "@/lib/resolve-locale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    restaurants.map((restaurant) => ({ locale, slug: restaurant.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const restaurant = getRestaurant(slug);
  if (!restaurant) return { title: "CentarStory" };
  return { title: restaurant.name, description: pick(restaurant.summary, locale) };
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const restaurant = getRestaurant(slug);
  if (!restaurant) notFound();
  const district = getDistrict(restaurant.district);
  const t = await getTranslations("food");
  const common = await getTranslations("common");
  const nav = restaurant.coordinates
    ? pedestrianNavigation([MACEDONIA_SQUARE, restaurant.coordinates])
    : null;

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <Link href="/food" className="text-sm text-copper">
        {common("back")}
      </Link>
      <p className="mt-6 text-[11px] tracking-[0.2em] text-brass uppercase">
        {district ? pick(district.name, locale) : t("kitchens")}
      </p>
      {restaurant.municipality === "nearby" ? (
        <p className="mt-2 text-[11px] tracking-[0.16em] text-copper uppercase">{t("nearby")}</p>
      ) : null}
      <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">{restaurant.name}</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">{pick(restaurant.summary, locale)}</p>
      {restaurant.nearbyNote ? <p className="mt-3 text-sm text-ink-soft">{pick(restaurant.nearbyNote, locale)}</p> : null}
      {restaurant.address ? <p className="mt-4 text-sm">{pick(restaurant.address, locale)}</p> : null}
      {restaurant.phone ? (
        <p className="mt-2 text-sm">
          <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`}>{restaurant.phone}</a>
        </p>
      ) : null}
      {restaurant.website ? (
        <p className="mt-2 text-sm">
          <a href={restaurant.website} className="text-copper" target="_blank" rel="noreferrer">
            {restaurant.website}
          </a>
        </p>
      ) : null}
      {!restaurant.coordinates ? <p className="mt-3 text-sm text-copper">{t("unmapped")}</p> : null}
      {district ? (
        <>
          <h2 className="mt-10 font-display text-3xl">{t("approach")}</h2>
          <p className="mt-3 leading-relaxed">{pick(district.approach, locale)}</p>
          <p className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href={`/?place=${district.slug}`} className="text-copper">
              {common("onMap")}
            </Link>
            {nav?.osm ? (
              <a href={nav.osm} target="_blank" rel="noreferrer">
                {t("osmWalk")}
              </a>
            ) : null}
          </p>
        </>
      ) : null}
      <h2 className="mt-10 font-display text-3xl">{t("serves")}</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {restaurant.serves.map((slugOfDish) => {
          const dish = getDish(slugOfDish);
          if (!dish) return null;
          return (
            <li key={dish.slug}>
              <Link href={`/food/dishes/${dish.slug}`} className="flex h-14 items-center font-display text-2xl">
                {pick(dish.name, locale)}
              </Link>
            </li>
          );
        })}
      </ul>
      <h2 className="mt-10 font-display text-3xl">{t("price")}</h2>
      <p className="mt-3 leading-relaxed">{pick(restaurant.practical, locale)}</p>
      <p className="mt-3 leading-relaxed text-ink-soft">{t("priceBody")}</p>
      <p className="mt-4 text-xs text-brass">{t("lastChecked", { date: restaurant.lastChecked })}</p>
    </article>
  );
}
