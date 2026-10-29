"use client";

import { useLocale, useTranslations } from "next-intl";
import { pick } from "@/content/copy";
import { listEvents } from "@/content/journeys";
import { formatIsoDay } from "@/lib/format";
import { calendarLinks } from "@/content/mobility";
import { getPlace } from "@/content/places";
import type { CulturalEvent } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { closedEvents, confirmDateEvents, liveEvents } from "@/lib/events/group";

function Status({ event }: { event: CulturalEvent }) {
  const t = useTranslations("explore");
  const locale = useLocale();
  if (event.status === "upcoming" && event.nextDate) {
    return t("eventStatusUpcoming", { date: formatIsoDay(event.nextDate, locale) });
  }
  if (event.status === "ongoing") return t("eventStatusOngoing");
  if (event.status === "past") return t("eventStatusPast");
  return t("eventConfirm");
}

function EventCard({ event }: { event: CulturalEvent }) {
  const locale = useLocale();
  const t = useTranslations("explore");
  const venue = event.venues[0] ? getPlace(event.venues[0]) : undefined;
  return (
    <article className="border border-line p-5">
      <p className="text-[11px] tracking-[0.16em] text-brass uppercase">
        <Status event={event} />
      </p>
      <h3 className="mt-3 font-display text-3xl leading-none">
        <Link href={`/events/${event.slug}`}>{pick(event.name, locale)}</Link>
      </h3>
      <p className="mt-2 text-sm text-ink-soft">{pick(event.season, locale)}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(event.summary, locale)}</p>
      {venue ? <p className="mt-3 text-sm">{pick(venue.name, locale)}</p> : null}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <a href={event.officialUrl} className="text-copper" target="_blank" rel="noreferrer">
          {t("officialSource")}
        </a>
        <span className="text-ink-soft">{t("lastVerified", { date: event.lastChecked })}</span>
      </div>
    </article>
  );
}

export function CulturalCalendar({ venue }: { venue?: string }) {
  const t = useTranslations("explore");
  const events = listEvents();
  const list = venue ? events.filter((event) => event.venues.includes(venue)) : events;
  const live = liveEvents(list);
  const closed = closedEvents(list);
  const confirm = confirmDateEvents(list);

  return (
    <div suppressHydrationWarning>
      {live.length === 0 ? (
        <div className="border border-line bg-paper-2 p-6">
          <p className="font-display text-3xl">{t("eventsEmpty")}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{t("eventsEmptyBody")}</p>
          <ul className="mt-4 flex flex-wrap gap-4 text-sm">
            {calendarLinks.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="text-copper" target="_blank" rel="noreferrer">
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {live.map((event) => (
            <li key={event.slug}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
      {confirm.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("eventsConfirmTitle")}</h3>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {confirm.map((event) => (
              <li key={event.slug} className="py-4">
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {closed.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("eventsClosedTitle")}</h3>
          <ul className="mt-3 grid gap-3 lg:grid-cols-2">
            {closed.map((event) => (
              <li key={event.slug}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
