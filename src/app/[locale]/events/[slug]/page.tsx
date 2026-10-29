import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { pick } from "@/content/copy";
import { events, getEvent } from "@/content/journeys";
import { getPlace, sitePath } from "@/content/places";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
import { formatIsoDay } from "@/lib/format";
import { resolveLocale } from "@/lib/resolve-locale";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => events.map((event) => ({ locale, slug: event.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const event = getEvent(slug);
  if (!event) return { title: "CentarStory" };
  return { title: pick(event.name, locale), description: pick(event.summary, locale) };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const locale = await resolveLocale(params);
  const event = getEvent(slug);
  if (!event) notFound();
  const detail = await getTranslations("detail");
  const explore = await getTranslations("explore");
  const common = await getTranslations("common");
  const venues = event.venues.flatMap((venue) => {
    const place = getPlace(venue);
    return place ? [place] : [];
  });

  return (
    <article className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <Link href="/" className="text-sm text-copper">
        {common("back")}
      </Link>
      <p className="mt-6 text-[11px] tracking-[0.2em] text-brass uppercase">
        {detail("season")} · {pick(event.season, locale)}
      </p>
      <p className="mt-2 text-sm text-copper">
        {event.status === "upcoming" && event.nextDate
          ? explore("eventStatusUpcoming", { date: formatIsoDay(event.nextDate, locale) })
          : event.status === "ongoing"
            ? explore("eventStatusOngoing")
            : event.status === "past"
              ? explore("eventStatusPast")
              : explore("eventConfirm")}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">{pick(event.name, locale)}</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">{pick(event.summary, locale)}</p>
      <p className="mt-6 leading-relaxed">{pick(event.story, locale)}</p>
      <p className="mt-4 text-sm text-ink-soft">{explore("eventsNote")}</p>
      <p className="mt-3 text-sm">
        <a href={event.officialUrl} className="text-copper underline" target="_blank" rel="noreferrer">
          {explore("officialSource")}
        </a>
      </p>
      <p className="mt-2 text-sm text-ink-soft">{explore("lastVerified", { date: event.lastChecked })}</p>
      {venues.length > 0 ? (
        <>
          <h2 className="mt-10 font-display text-3xl">{detail("stops")}</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {venues.map((place) => (
              <li key={place.slug}>
                <Link href={sitePath(place)} className="flex h-14 items-center font-display text-2xl">
                  {pick(place.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}
