import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { WalkPreview } from "@/components/journeys/walk-preview";
import { pick } from "@/content/copy";
import { getWalk, walks } from "@/content/journeys";
import { getPlace, sitePath } from "@/content/places";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
import { resolveLocale } from "@/lib/resolve-locale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => walks.map((walk) => ({ locale, slug: walk.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const walk = getWalk(slug);
  if (!walk) return { title: "CentarStory" };
  return { title: pick(walk.name, locale), description: pick(walk.summary, locale) };
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const walk = getWalk(slug);
  if (!walk) notFound();
  const detail = await getTranslations("detail");
  const common = await getTranslations("common");
  const stops = walk.stops.flatMap((stop) => {
    const place = getPlace(stop);
    return place ? [place] : [];
  });

  return (
    <article className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <Link href="/" className="text-sm text-copper">
        {common("back")}
      </Link>
      <h1 className="mt-6 font-display text-5xl leading-[0.95] sm:text-6xl">{pick(walk.name, locale)}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{pick(walk.story, locale)}</p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed">{pick(walk.duration, locale)}</p>
      <div className="mt-8">
        <WalkPreview
          label={pick(walk.name, locale)}
          markers={stops.map((place) => ({
            id: place.slug,
            lat: place.coordinates.lat,
            lng: place.coordinates.lng,
            label: pick(place.name, locale),
            tone: "site" as const,
          }))}
        />
      </div>
      <h2 className="mt-10 font-display text-3xl">{detail("stops")}</h2>
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {stops.map((place, index) => (
          <li key={place.slug}>
            <Link href={sitePath(place)} className="grid grid-cols-[3rem_1fr] items-baseline py-4">
              <span className="font-display text-xl text-brass">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-display text-3xl">{pick(place.name, locale)}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link href={`/?walk=${walk.slug}`} className="mt-6 inline-flex h-11 items-center text-copper">
        {detail("openAtlas")}
      </Link>
    </article>
  );
}
