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
    <article>
      <header className="border-b border-ink bg-paper-2">
        <div className="mx-auto max-w-[96rem] px-5 py-14 lg:px-8 lg:py-20">
          <Link href="/food" className="cs-btn cs-btn-ghost">
            {common("back")}
          </Link>
          <p className="cs-kicker mt-8">{pick(dish.eyebrow, locale)}</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.86] sm:text-8xl">{pick(dish.name, locale)}</h1>
          {record?.nameMk ? <p className="mt-3 font-display text-3xl text-brass">{record.nameMk}</p> : null}
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">{pick(dish.summary, locale)}</p>
        </div>
      </header>
      <div className="mx-auto grid max-w-[96rem] gap-12 px-5 py-16 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <h2 className="cs-kicker">{t("history")}</h2>
          <p className="mt-4 font-display text-3xl leading-snug sm:text-4xl">{pick(dish.story[0], locale)}</p>
          <p className="mt-6 text-lg leading-relaxed">{pick(dish.story[1], locale)}</p>
          <p className="mt-8 border-t border-ink pt-6 text-sm leading-relaxed text-ink-soft">{t("recipeNote")}</p>
        </div>
        <div className="border-t border-ink pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <h2 className="font-display text-3xl">{t("served")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(dish.eat, locale)}</p>
          {houses.length === 0 ? (
            <p className="mt-4 text-sm">{t("noneServed")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink border-y border-ink">
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
