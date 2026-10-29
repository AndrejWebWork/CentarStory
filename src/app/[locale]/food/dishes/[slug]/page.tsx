import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { pick } from "@/content/copy";
import { dishes, getDish, getDistrict, restaurantsForDish } from "@/content/food";
import { dishes as dishRecords } from "@/content/knowledge/culinary";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
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

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <Link href="/food" className="text-sm text-copper">
        {common("back")}
      </Link>
      <p className="mt-6 text-[11px] tracking-[0.2em] text-brass uppercase">{pick(dish.eyebrow, locale)}</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">{pick(dish.name, locale)}</h1>
      {record?.nameMk ? <p className="mt-2 text-xl text-ink-soft">{record.nameMk}</p> : null}
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">{pick(dish.summary, locale)}</p>
      <h2 className="mt-10 text-[11px] tracking-[0.18em] text-brass uppercase">{t("history")}</h2>
      <p className="mt-4 font-display text-3xl leading-snug">{pick(dish.story[0], locale)}</p>
      <p className="mt-5 leading-relaxed">{pick(dish.story[1], locale)}</p>
      <h2 className="mt-10 font-display text-3xl">{t("served")}</h2>
      <p className="mt-3 leading-relaxed text-ink-soft">{pick(dish.eat, locale)}</p>
      {houses.length === 0 ? (
        <p className="mt-4 text-sm">{t("noneServed")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {houses.map((house) => {
            const district = getDistrict(house.district);
            return (
              <li key={house.slug}>
                <Link href={`/food/places/${house.slug}`} className="flex h-14 items-center justify-between">
                  <span className="font-display text-2xl">{house.name}</span>
                  <span className="text-sm text-brass">{district ? pick(district.name, locale) : ""}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <h2 className="mt-10 font-display text-3xl">{t("price")}</h2>
      <p className="mt-3 leading-relaxed">{t("priceBody")}</p>
      <p className="mt-6 text-sm leading-relaxed text-ink-soft">{t("recipeNote")}</p>
      {record ? (
        <p className="mt-4 text-xs text-brass">{t("lastChecked", { date: record.lastChecked })}</p>
      ) : null}
    </article>
  );
}
