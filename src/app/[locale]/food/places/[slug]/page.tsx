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
    <article>
      <header className="border-b border-ink bg-ink text-foam">
        <div className="mx-auto max-w-[96rem] px-5 py-14 lg:px-8 lg:py-20">
          <Link href="/food" className="cs-btn cs-btn-ghost border-foam/40 text-foam">
            {common("back")}
          </Link>
          <p className="cs-kicker mt-8 text-brass">
            {district ? pick(district.name, locale) : t("kitchens")}
          </p>
          {restaurant.municipality === "nearby" ? (
            <p className="mt-2 text-xs tracking-[0.18em] text-copper uppercase">{t("nearby")}</p>
          ) : null}
          <h1 className="mt-3 font-display text-6xl leading-[0.86] sm:text-8xl">{restaurant.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foam/80">{pick(restaurant.summary, locale)}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-[96rem] gap-12 px-5 py-16 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <h2 className="font-display text-4xl">{t("serves")}</h2>
          <ul className="mt-4 divide-y divide-ink border-y border-ink">
            {restaurant.serves.map((slugOfDish) => {
              const dish = getDish(slugOfDish);
              if (!dish) return null;
              return (
                <li key={dish.slug}>
                  <Link
                    href={`/food/dishes/${dish.slug}`}
                    className="flex h-16 items-center font-display text-3xl hover:text-cobalt"
                  >
                    {pick(dish.name, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <h2 className="mt-10 font-display text-3xl">{t("price")}</h2>
          <p className="mt-3 leading-relaxed">{pick(restaurant.practical, locale)}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("priceBody")}</p>
        </div>
        <div className="border-t border-ink pt-6 text-sm lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {restaurant.nearbyNote ? <p className="text-ink-soft">{pick(restaurant.nearbyNote, locale)}</p> : null}
          {restaurant.address ? <p className="mt-4">{pick(restaurant.address, locale)}</p> : null}
          {restaurant.phone ? (
            <p className="mt-2">
              <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`}>{restaurant.phone}</a>
            </p>
          ) : null}
          {restaurant.website ? (
            <p className="mt-2">
              <a href={restaurant.website} className="text-copper underline" target="_blank" rel="noreferrer">
                {restaurant.website}
              </a>
            </p>
          ) : null}
          {!restaurant.coordinates ? <p className="mt-3 text-copper">{t("unmapped")}</p> : null}
          {district ? (
            <div className="mt-8">
              <h2 className="font-display text-3xl">{t("approach")}</h2>
              <p className="mt-3 leading-relaxed">{pick(district.approach, locale)}</p>
              <p className="mt-4 flex flex-wrap gap-3">
                <Link href={`/?place=${district.slug}`} className="cs-btn cs-btn-ink">
                  {common("onMap")}
                </Link>
                {nav?.osm ? (
                  <a href={nav.osm} className="cs-btn cs-btn-ghost" target="_blank" rel="noreferrer">
                    {t("osmWalk")}
                  </a>
                ) : null}
              </p>
            </div>
          ) : null}
          <p className="mt-8 text-xs tracking-[0.16em] text-brass uppercase">
            {t("lastChecked", { date: restaurant.lastChecked })}
          </p>
        </div>
      </div>
    </article>
  );
}
