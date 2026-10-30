import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { pick } from "@/content/copy";
import { dishes, getDish, getDistrict, restaurantsForDish } from "@/content/food";
import { dishes as dishRecords } from "@/content/knowledge/culinary";
import { getMedia } from "@/content/knowledge/media";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import { resolveLocale } from "@/lib/resolve-locale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => dishes.map((dish) => ({ locale, slug: dish.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const dish = getDish(slug);
  if (!dish) return { title: "CentarStory" };
  return { title: pick(dish.name, locale), description: pick(dish.summary, locale) };
}

export default async function DishPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const dish = getDish(slug);
  if (!dish) notFound();
  const t = await getTranslations("food");
  const common = await getTranslations("common");
  const houses = restaurantsForDish(dish.slug);
  const record = dishRecords.find((item) => item.slug === dish.slug);
  const photo = dish.imageId ? getMedia(dish.imageId) : undefined;

  return (
    <article>
      <header className="relative mx-3 mt-3 overflow-hidden bg-ink text-foam sm:mx-4">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(photo, 1600)}
            srcSet={mediaSrcSet(photo)}
            sizes="100vw"
            alt={pick(photo.caption, locale)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/30" />
        <div className="relative mx-auto max-w-[96rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <Link href="/food" className="cs-btn cs-btn-ghost border-foam/25 text-foam">
            {common("back")}
          </Link>
          <p className="cs-kicker mt-8 text-brass">{pick(dish.eyebrow, locale)}</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.86] sm:text-8xl">{pick(dish.name, locale)}</h1>
          {record?.nameMk ? <p className="mt-3 font-display text-3xl text-brass">{record.nameMk}</p> : null}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foam/80">{pick(dish.summary, locale)}</p>
          {photo ? (
            <p className="mt-6 text-[10px] tracking-[0.16em] text-brass uppercase">
              {photo.credit} · {photo.license}
            </p>
          ) : null}
        </div>
      </header>
      <div className="mx-auto grid max-w-[96rem] gap-12 px-5 py-16 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <h2 className="cs-kicker">{t("history")}</h2>
          <p className="mt-4 font-display text-3xl leading-snug sm:text-4xl">{pick(dish.story[0], locale)}</p>
          <p className="mt-6 text-lg leading-relaxed">{pick(dish.story[1], locale)}</p>
          <p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-ink-soft">{t("recipeNote")}</p>
        </div>
        <div className="rounded-[1.5rem] border border-line bg-foam p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:col-span-5">
          <h2 className="font-display text-3xl">{t("served")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(dish.eat, locale)}</p>
          {houses.length === 0 ? (
            <p className="mt-4 text-sm">{t("noneServed")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {houses.map((house) => {
                const district = getDistrict(house.district);
                return (
                  <li key={house.slug}>
                    <Link
                      href={`/food/places/${house.slug}`}
                      className="flex h-14 items-center justify-between hover:text-cobalt"
                    >
                      <span className="font-display text-2xl">{house.name}</span>
                      <span className="text-xs tracking-[0.14em] text-brass uppercase">
                        {district ? pick(district.name, locale) : ""}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <h2 className="mt-10 font-display text-3xl">{t("price")}</h2>
          <p className="mt-3 text-sm leading-relaxed">{t("priceBody")}</p>
          {record ? (
            <p className="mt-6 text-xs tracking-[0.16em] text-brass uppercase">
              {t("lastChecked", { date: record.lastChecked })}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
