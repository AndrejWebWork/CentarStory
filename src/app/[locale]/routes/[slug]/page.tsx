import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { WalkPreview } from "@/components/journeys/walk-preview";
import { BackLink } from "@/components/shell/back-link";
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
    <article>
      <header className="relative mx-3 mt-3 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#0f172a_0%,#1e3a8a_58%,#3b6dff_140%)] text-foam sm:mx-4">
        <div className="mx-auto max-w-[96rem] px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <BackLink href="/">{common("back")}</BackLink>
          <h1 className="mt-8 font-display text-6xl leading-[0.86] sm:text-8xl">{pick(walk.name, locale)}</h1>
          <div className="mt-8 grid gap-6 border-t border-foam/25 pt-6 lg:grid-cols-12">
            <p className="font-display text-2xl leading-snug text-foam/85 lg:col-span-7">{pick(walk.story, locale)}</p>
            <p className="text-sm leading-relaxed text-brass lg:col-span-5">{pick(walk.duration, locale)}</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[96rem] px-5 py-14 lg:px-8">
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
        <h2 className="mt-14 font-display text-5xl">{detail("stops")}</h2>
        <ol className="mt-6 divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line bg-foam px-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:px-7">
          {stops.map((place, index) => (
            <li key={place.slug}>
              <Link
                href={sitePath(place)}
                className="grid grid-cols-[4rem_1fr] items-baseline py-6 hover:text-cobalt"
              >
                <span className="font-display text-4xl text-copper">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <span className="block font-display text-4xl leading-none">{pick(place.name, locale)}</span>
                  <span className="mt-2 block text-xs text-ink-soft">{pick(place.address, locale)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
        <Link href="/around" className="cs-btn cs-btn-cobalt mt-8">
          {detail("openAtlas")}
        </Link>
      </div>
    </article>
  );
}
