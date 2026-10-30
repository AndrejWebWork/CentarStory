import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { FoodCover } from "@/components/food/food-cover";
import { BackLink } from "@/components/shell/back-link";
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
      <header className="group relative mx-3 mt-3 overflow-hidden rounded-[1.75rem] bg-ink text-foam sm:mx-4">
        <FoodCover serves={restaurant.serves} locale={locale} alt={restaurant.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="relative mx-auto max-w-[96rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <BackLink href="/food">{common("back")}</BackLink>
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
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {restaurant.serves.map((slugOfDish) => {
              const dish = getDish(slugOfDish);
              if (!dish) return null;
              return (
                <li key={dish.slug}>
                  <Link
                    href={`/food/dishes/${dish.slug}`}
                    className="group relative flex aspect-square flex-col justify-end overflow-hidden p-3 text-foam"
                  >
                    <FoodCover serves={[dish.slug]} locale={locale} alt={pick(dish.name, locale)} />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
                    <span className="relative font-display text-xl leading-none sm:text-2xl">{pick(dish.name, locale)}</span>
                    <span className="cs-food-link relative mt-3 w-fit">{t("open")}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <h2 className="mt-10 font-display text-3xl">{t("price")}</h2>
          <p className="mt-3 leading-relaxed">{pick(restaurant.practical, locale)}</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t("priceBody")}</p>
        </div>
        <div className="rounded-[1.5rem] border border-line bg-foam p-6 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:col-span-5">
          {restaurant.nearbyNote ? <p className="text-ink-soft">{pick(restaurant.nearbyNote, locale)}</p> : null}
          {restaurant.address ? <p className="mt-4">{pick(restaurant.address, locale)}</p> : null}
          {restaurant.phone ? (
            <p className="mt-4">
              <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`} className="cs-food-link bg-ink text-foam">
                {restaurant.phone}
              </a>
            </p>
          ) : null}
          {restaurant.website ? (
            <p className="mt-3">
              <a href={restaurant.website} className="cs-food-link bg-ink text-foam" target="_blank" rel="noreferrer">
                {restaurant.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              </a>
            </p>
          ) : null}
          {!restaurant.coordinates ? <p className="mt-3 text-copper">{t("unmapped")}</p> : null}
          {district ? (
            <div className="mt-8">
              <h2 className="font-display text-3xl">{t("approach")}</h2>
              <p className="mt-3 leading-relaxed">{pick(district.approach, locale)}</p>
              <p className="mt-4 flex flex-wrap gap-3">
                <Link href="/around" className="cs-btn cs-btn-ink">
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
