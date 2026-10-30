import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/shell/back-link";
import { pick } from "@/content/copy";
import { getEvent, listEvents } from "@/content/journeys";
import { getPlace, sitePath } from "@/content/places";
import { Link } from "@/i18n/navigation";
import { locales } from "@/i18n/locales";
import { noticeLabelKey } from "@/lib/events/notice";
import { formatIsoDay } from "@/lib/format";
import { resolveLocale } from "@/lib/resolve-locale";

export const dynamicParams = true;

export function generateStaticParams() {
  return locales.flatMap((locale) => listEvents().map((event) => ({ locale, slug: event.slug })));
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
    <article>
      <header className="relative mx-3 mt-3 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#0f172a_0%,#1e3a8a_58%,#3b6dff_140%)] text-foam sm:mx-4">
        <div className="absolute top-2 left-2 z-10">
          <BackLink href={event.host === "municipality" ? "/events" : "/"}>{common("back")}</BackLink>
        </div>
        <div className="mx-auto max-w-[96rem] px-5 pt-28 pb-12 sm:px-8 sm:pt-32 sm:pb-16 lg:px-10 lg:pt-36 lg:pb-20">
          <p className="cs-kicker text-brass">
            {detail("season")} · {pick(event.season, locale)}
          </p>
          <p className="mt-2 text-xs tracking-[0.18em] text-foam/75 uppercase">
            {event.status === "upcoming" && event.nextDate
              ? explore("eventStatusUpcoming", { date: formatIsoDay(event.nextDate, locale) })
              : event.status === "ongoing"
                ? explore("eventStatusOngoing")
                : event.status === "past"
                  ? explore("eventStatusPast")
                  : explore("eventConfirm")}
          </p>
          <h1 className="mt-4 max-w-5xl font-display text-5xl leading-[0.88] sm:text-7xl">
            {pick(event.name, locale)}
          </h1>
        </div>
      </header>
      <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-14 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <p className="font-display text-3xl leading-snug">{pick(event.summary, locale)}</p>
          <p className="mt-6 text-lg leading-relaxed">{pick(event.story, locale)}</p>
        </div>
        <div className="rounded-[1.5rem] border border-line bg-foam p-6 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:col-span-5">
          <p className="text-ink-soft">{explore("eventsNote")}</p>
          <p className="mt-4">
            <a href={event.officialUrl} className="cs-btn cs-btn-cobalt" target="_blank" rel="noreferrer">
              {explore(noticeLabelKey(event.officialUrl))}
            </a>
          </p>
          <p className="mt-4 text-xs tracking-[0.16em] text-brass uppercase">
            {explore("lastVerified", { date: event.lastChecked })}
          </p>
          {venues.length > 0 ? (
            <div className="mt-10">
              <h2 className="font-display text-3xl">{detail("stops")}</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {venues.map((place) => (
                  <li key={place.slug}>
                    <Link href={sitePath(place)} className="flex h-14 items-center font-display text-2xl hover:text-cobalt">
                      {pick(place.name, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
