"use client";

import { MapPinned } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { pick } from "@/content/copy";
import { calendarLinks } from "@/content/mobility";
import { getPlace, sitePath } from "@/content/places";
import { listEvents } from "@/content/journeys";
import type { CulturalEvent } from "@/content/types";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/locales";
import { formatIsoDay } from "@/lib/format";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import { closedEvents, confirmDateEvents, liveEvents } from "@/lib/events/group";
import { noticeLabelKey } from "@/lib/events/notice";
import { eventImage, eventImageFocus } from "@/lib/events/photo";

function eventDay(event: CulturalEvent) {
  return event.startDate ?? event.nextDate;
}

const weekdays: Record<Locale, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  mk: ["нед", "пон", "вто", "сре", "чет", "пет", "саб"],
  sr: ["ned", "pon", "uto", "sre", "čet", "pet", "sub"],
  tr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"],
  uk: ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
  sq: ["die", "hën", "mar", "mër", "enj", "pre", "sht"],
};

function dayBits(iso: string, locale: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const index = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const names = weekdays[locale as Locale] ?? weekdays.en;
  return { weekday: names[index] ?? "", day: String(day) };
}

function covers(event: CulturalEvent, iso: string) {
  const start = event.startDate ?? event.nextDate;
  if (!start) return false;
  const end = event.endDate ?? start;
  return iso >= start && iso <= end;
}

export function EventBoard() {
  const t = useTranslations("events");
  const explore = useTranslations("explore");
  const locale = useLocale();
  const events = listEvents().filter((event) => event.host === "municipality");
  const live = liveEvents(events);
  const confirm = confirmDateEvents(events);
  const closed = closedEvents(events);
  const ordered = [...live, ...confirm, ...closed].sort((a, b) =>
    (eventDay(b) ?? "").localeCompare(eventDay(a) ?? ""),
  );
  const days = (() => {
    const unique = new Set<string>();
    for (const event of ordered) {
      const day = eventDay(event);
      if (day) unique.add(day);
    }
    return [...unique].sort((a, b) => b.localeCompare(a));
  })();
  const [selected, setSelected] = useState<string | null>(null);
  const visible = selected ? ordered.filter((event) => covers(event, selected)) : ordered;
  const featured = visible[0];
  const rest = visible.slice(1);
  const official = calendarLinks.filter((link) => link.id === "centar");

  return (
    <div className="cs-events-stage">
      <header className="cs-events-hero relative overflow-hidden px-4 py-9 text-foam sm:px-6 sm:py-12 lg:px-8">
        <EventsPoster />
        <div className="relative mx-auto max-w-[96rem]">
          <p className="cs-kicker m-0 text-foam/60">{t("kicker")}</p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,7vw,4.2rem)] leading-[0.92]">{t("title")}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foam/75">{t("lede")}</p>
        </div>
      </header>
      <div className="mx-auto max-w-[96rem] px-4 py-5 sm:px-5 lg:px-8 lg:py-8">

      {days.length > 0 ? (
        <ul
          className="cs-no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8"
          suppressHydrationWarning
        >
          {days.map((iso) => {
            const bits = dayBits(iso, locale);
            const on = selected === iso;
            return (
              <li key={iso} className="shrink-0 snap-start">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSelected(on ? null : iso)}
                  className={`grid h-[4.25rem] w-[3.4rem] place-items-center rounded-md ${
                    on ? "bg-ink text-foam" : "bg-foam text-ink"
                  }`}
                >
                  <span className={`text-[10px] tracking-[0.08em] uppercase ${on ? "text-foam/60" : "text-ink-soft"}`}>
                    {bits.weekday}
                  </span>
                  <span className="font-display text-xl leading-none">{bits.day}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {featured ? (
        <Featured event={featured} />
      ) : (
        <div className="mt-5 rounded-xl bg-ink p-6 text-foam">
          <p className="font-display text-3xl leading-none">{explore("eventsEmpty")}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-foam/70">{explore("eventsEmptyBody")}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {official.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="cs-btn bg-foam text-ink" target="_blank" rel="noreferrer">
                  {explore(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {rest.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {rest.map((event) => (
            <li key={event.slug}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-ink-soft">{t("inventoryNote")}</p>
      </div>
    </div>
  );
}

function EventsPoster() {
  return (
    <svg className="cs-events-hero__poster" viewBox="0 0 760 320" aria-hidden="true">
      <path d="M86 292V78c0-36 30-58 68-58h210c38 0 68 22 68 58v214" />
      <path d="M104 292V96c18-28 52-44 100-44s82 16 100 44v196" />
      <path d="M118 292c8-34 28-52 52-52s44 18 52 52" />
      <path d="M168 292c6-22 16-34 28-34s22 12 28 34" />
      <path d="M470 78h196M470 108h196M470 138h196M470 168h196M470 198h196" />
      <circle className="is-note" cx="512" cy="123" r="5" />
      <circle className="is-note" cx="548" cy="153" r="5" />
      <circle className="is-note" cx="602" cy="93" r="5" />
      <path d="M512 123v-28M548 153v-22M602 93v-26" />
      <path d="M668 36h46v248h-46" />
      <path d="M676 52h8M690 52h8M704 52h8M676 72h8M690 72h8M704 72h8M676 252h8M690 252h8M704 252h8M676 272h8M690 272h8M704 272h8" />
      <circle cx="628" cy="248" r="22" />
      <path d="M628 214v-12M628 294v12M594 248h-12M674 248h12M604 224l-8-8M652 272l8 8M652 224l8-8M604 272l-8 8" />
    </svg>
  );
}

function Featured({ event }: { event: CulturalEvent }) {
  const locale = useLocale();
  const explore = useTranslations("explore");
  const venue = event.venues[0] ? getPlace(event.venues[0]) : undefined;
  const photo = eventImage(event);
  return (
    <article className="relative mt-5 overflow-hidden rounded-xl bg-ink text-foam">
      <div className="relative min-h-[18rem] sm:min-h-[22rem]">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(photo, 1200)}
            srcSet={mediaSrcSet(photo)}
            sizes="(min-width: 1024px) 90rem, 100vw"
            alt={pick(photo.caption, locale)}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: eventImageFocus(event.slug) }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div className="relative flex min-h-[18rem] flex-col justify-end p-5 sm:min-h-[22rem] sm:p-7">
          <p className="text-[10px] tracking-[0.18em] text-foam/70 uppercase">{pick(event.season, locale)}</p>
          <h2 className="mt-2 max-w-3xl font-display text-4xl leading-[0.92] sm:text-6xl">
            <Link href={`/events/${event.slug}`}>{pick(event.name, locale)}</Link>
          </h2>
          <p className="mt-3 flex min-w-0 items-center gap-1.5 text-sm text-foam/80">
            <MapPinned className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0">{venue ? pick(venue.name, locale) : explore("unmappedVenue")}</span>
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Link href={`/events/${event.slug}`} className="cs-btn h-auto min-h-11 bg-foam py-2 text-ink">
              {explore("openStory")}
            </Link>
            <a
              href={event.officialUrl}
              className="cs-btn h-auto min-h-11 border border-foam/25 bg-transparent py-2 text-foam"
              target="_blank"
              rel="noreferrer"
            >
              {explore(noticeLabelKey(event.officialUrl))}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function EventCard({ event }: { event: CulturalEvent }) {
  const locale = useLocale();
  const explore = useTranslations("explore");
  const venue = event.venues[0] ? getPlace(event.venues[0]) : undefined;
  const photo = eventImage(event);
  const when = event.nextDate ? formatIsoDay(event.nextDate, locale) : pick(event.season, locale);
  return (
    <article className="flex min-w-0 gap-3 overflow-hidden rounded-xl bg-foam p-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <Link
        href={`/events/${event.slug}`}
        className="relative min-h-[8.5rem] w-[42%] max-w-44 shrink-0 overflow-hidden rounded-md bg-ink"
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(photo, 400)}
            alt={pick(photo.caption, locale)}
            className="h-full w-full object-cover"
            style={{ objectPosition: eventImageFocus(event.slug) }}
          />
        ) : (
          <span className="grid h-full place-items-center font-display text-2xl text-foam/80">
            {pick(event.name, locale).slice(0, 1)}
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col py-1">
        <h3 className="font-display text-lg leading-tight sm:text-xl">
          <Link href={`/events/${event.slug}`}>{pick(event.name, locale)}</Link>
        </h3>
        <p className="mt-1 text-xs text-ink-soft">{when}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-ink-soft">
          <MapPinned className="size-3 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">
            {venue ? (
              <Link href={sitePath(venue)} className="block truncate hover:text-cobalt">
                {pick(venue.name, locale)}
              </Link>
            ) : (
              explore("unmappedVenue")
            )}
          </span>
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Link href={`/events/${event.slug}`} className="rounded-md bg-ink px-3 py-1.5 text-[10px] tracking-[0.12em] text-foam uppercase">
            {explore("openStory")}
          </Link>
          <a href={event.officialUrl} className="text-[11px] font-semibold tracking-[0.08em] text-cobalt uppercase underline underline-offset-4" target="_blank" rel="noreferrer">
            {explore(noticeLabelKey(event.officialUrl))}
          </a>
        </div>
      </div>
    </article>
  );
}
