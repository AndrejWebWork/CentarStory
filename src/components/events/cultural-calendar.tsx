"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { pick } from "@/content/copy";
import { listEvents } from "@/content/journeys";
import { formatIsoDay } from "@/lib/format";
import { calendarLinks } from "@/content/mobility";
import { getPlace, sitePath } from "@/content/places";
import type { CulturalEvent, EventHost } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { closedEvents, confirmDateEvents, liveEvents } from "@/lib/events/group";
import { noticeLabelKey } from "@/lib/events/notice";

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

function EventRow({ event, index }: { event: CulturalEvent; index: number }) {
  const locale = useLocale();
  const t = useTranslations("explore");
  const venue = event.venues[0] ? getPlace(event.venues[0]) : undefined;
  return (
    <article className="grid gap-4 border border-line bg-foam px-5 py-6 sm:px-6 lg:grid-cols-12 lg:items-baseline">
      <div className="lg:col-span-3">
        <p className="text-[10px] tracking-[0.22em] text-copper uppercase">
          {String(index + 1).padStart(2, "0")} · <Status event={event} />
        </p>
        <p className="mt-2 font-display text-3xl leading-none text-brass">{pick(event.season, locale)}</p>
      </div>
      <div className="lg:col-span-6">
        <h3 className="font-display text-4xl leading-[0.92]">
          <Link href={`/events/${event.slug}`} className="hover:text-cobalt">
            {pick(event.name, locale)}
          </Link>
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">{pick(event.summary, locale)}</p>
      </div>
      <div className="text-xs lg:col-span-3 lg:text-right">
        {venue ? (
          <Link href={sitePath(venue)} className="block font-medium text-ink hover:text-cobalt">
            {pick(venue.name, locale)}
          </Link>
        ) : (
          <p className="text-ink-soft">{t("unmappedVenue")}</p>
        )}
        <p className="mt-3">
          <a href={event.officialUrl} className="text-[11px] tracking-[0.16em] text-copper uppercase underline" target="_blank" rel="noreferrer">
            {t(noticeLabelKey(event.officialUrl))}
          </a>
        </p>
        <p className="mt-1 text-[11px] text-ink-soft">{t("lastVerified", { date: event.lastChecked })}</p>
      </div>
    </article>
  );
}

export function CulturalCalendar({ venue, host }: { venue?: string; host?: EventHost }) {
  const t = useTranslations("explore");
  const reduce = useReducedMotion();
  const events = listEvents();
  const list = events.filter((event) => {
    if (venue && !event.venues.includes(venue)) return false;
    if (host && event.host !== host) return false;
    return true;
  });
  const live = liveEvents(list);
  const closed = closedEvents(list);
  const confirm = confirmDateEvents(list);
  const official = host === "municipality" ? calendarLinks.filter((link) => link.id === "centar") : calendarLinks;

  return (
    <div suppressHydrationWarning>
      {live.length === 0 ? (
        <div className="grid gap-6 border border-line bg-foam p-6 lg:grid-cols-12 lg:p-8">
          <div className="lg:col-span-7">
            <p className="font-display text-4xl leading-none">{t("eventsEmpty")}</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{t("eventsEmptyBody")}</p>
          </div>
          <ul className="flex flex-wrap items-end gap-2 lg:col-span-5 lg:justify-end">
            {official.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="cs-btn cs-btn-ink" target="_blank" rel="noreferrer">
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="space-y-3">
          {live.map((event, index) => (
            <motion.li
              key={event.slug}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
            >
              <EventRow event={event} index={index} />
            </motion.li>
          ))}
        </ul>
      )}
      {confirm.length > 0 ? (
        <div className="mt-14">
          <h3 className="cs-kicker">{t("eventsConfirmTitle")}</h3>
          <ul className="mt-4 space-y-3">
            {confirm.map((event, index) => (
              <li key={event.slug}>
                <EventRow event={event} index={index} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {closed.length > 0 ? (
        <div className="mt-14">
          <h3 className="cs-kicker">{t("eventsClosedTitle")}</h3>
          <ul className="mt-4 space-y-3">
            {closed.map((event, index) => (
              <motion.li
                key={event.slug}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.18) }}
              >
                <EventRow event={event} index={index} />
              </motion.li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
