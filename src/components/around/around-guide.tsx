"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { pick } from "@/content/copy";
import { haversineMeters, MACEDONIA_SQUARE } from "@/content/knowledge/boundary";
import { enjoyExample, enjoyTariff, jspHow, wiziExample, wiziTariff, ammPublishedStops, binbin } from "@/content/mobility";
import { institutions, places, sitePath } from "@/content/places";
import { venues } from "@/content/knowledge/culinary";
import { airportTaxi, jspFares, transportLinks } from "@/content/transport";
import { Link } from "@/i18n/navigation";
import { formatCount, formatMkd } from "@/lib/format";
import { pedestrianNavigation } from "@/lib/mapping/walk";

const modes = ["walk", "bus", "bicycle", "scooter", "taxi", "compare"] as const;

type Destination = {
  id: string;
  kind: "place" | "museum" | "kitchen";
  name: string;
  href: string;
  coordinates?: { lat: number; lng: number };
  walkMinutes?: number;
  unmapped?: boolean;
};

export function AroundGuide() {
  const t = useTranslations("around");
  const locale = useLocale();
  const [mode, setMode] = useState<(typeof modes)[number]>("walk");
  const destinations = useMemo<Destination[]>(() => {
    const sites = places.map((place) => ({
      id: place.slug,
      kind: place.institution ? ("museum" as const) : ("place" as const),
      name: pick(place.name, locale),
      href: sitePath(place),
      coordinates: place.coordinates,
      walkMinutes: place.walkMinutes,
    }));
    const kitchens = venues.map((house) => ({
      id: `kitchen-${house.slug}`,
      kind: "kitchen" as const,
      name: house.name,
      href: `/food/places/${house.slug}`,
      coordinates: house.coordinates,
      unmapped: !house.coordinates,
    }));
    return [...sites, ...kitchens];
  }, [locale]);
  const [destinationId, setDestinationId] = useState(destinations[0]?.id ?? "");
  const destination = destinations.find((item) => item.id === destinationId);
  const ordered = [...places].sort((a, b) => a.walkMinutes - b.walkMinutes);
  const straightKm = destination?.coordinates
    ? haversineMeters(MACEDONIA_SQUARE, destination.coordinates) / 1000
    : null;
  const taxi = straightKm != null ? wiziExample(straightKm) : null;
  const walkMin = destination?.walkMinutes;
  const scooterMinutes = walkMin != null && walkMin > 0 ? Math.max(1, Math.round(walkMin * 0.4)) : walkMin === 0 ? 1 : null;
  const scooterQuote = scooterMinutes != null ? enjoyExample(scooterMinutes) : null;
  const nav =
    destination?.coordinates &&
    pedestrianNavigation([MACEDONIA_SQUARE, destination.coordinates]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12" suppressHydrationWarning>
      <header className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">05 — {t("kicker")}</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.92] sm:text-7xl">{t("title")}</h1>
        </div>
        <p className="max-w-md leading-relaxed text-ink-soft lg:col-span-4 lg:col-start-9 lg:pt-10">{t("lede")}</p>
      </header>
      <label className="mt-8 block max-w-xl">
        <span className="text-[11px] tracking-[0.18em] text-brass uppercase">{t("destination")}</span>
        <select
          className="mt-2 h-12 w-full border border-line bg-transparent px-3"
          value={destinationId}
          onChange={(event) => setDestinationId(event.target.value)}
        >
          {destinations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.unmapped ? ` (${t("unmapped")})` : ""}
            </option>
          ))}
        </select>
      </label>
      {destination?.unmapped ? <p className="mt-3 max-w-xl text-sm text-copper">{t("destUnmapped")}</p> : null}
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label={t("modes")}>
        {modes.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            id={`mode-${item}`}
            aria-selected={mode === item}
            aria-controls={`panel-${item}`}
            onClick={() => setMode(item)}
            className={`h-11 border px-3 text-sm ${mode === item ? "border-ink bg-ink text-foam" : "border-line"}`}
          >
            {t(item)}
          </button>
        ))}
      </div>
      <div className="mt-8" role="tabpanel" id={`panel-${mode}`} aria-labelledby={`mode-${mode}`}>
        {mode === "walk" ? (
          <div>
            <p className="max-w-2xl leading-relaxed">{t("walkBody")}</p>
            {destination && nav?.osm ? (
              <p className="mt-4 text-sm">
                <a className="text-copper" href={nav.osm} target="_blank" rel="noreferrer">
                  {t("osmWalk")}
                </a>
                {nav.google ? (
                  <>
                    {" · "}
                    <a href={nav.google} target="_blank" rel="noreferrer">
                      {t("googleWalk")}
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {ordered.map((place) => (
                <li key={place.slug} className="grid gap-2 py-4 sm:grid-cols-12 sm:items-baseline">
                  <span className="text-sm text-brass sm:col-span-3">
                    {place.walkMinutes === 0 ? t("fromSquare") : `${place.walkMinutes} min`}
                  </span>
                  <Link href={sitePath(place)} className="font-display text-2xl sm:col-span-5">
                    {pick(place.name, locale)}
                  </Link>
                  <span className="text-sm text-ink-soft sm:col-span-4">{pick(place.address, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {mode === "bus" ? (
          <div className="max-w-3xl space-y-5">
            <p className="leading-relaxed">{t("busBody")}</p>
            <p className="leading-relaxed">{t("busHow")}</p>
            <p className="leading-relaxed">{t("busAccount")}</p>
            <p className="leading-relaxed">{t("busValidate")}</p>
            <p className="text-sm text-ink-soft">{t("busNoLive")}</p>
            <table className="mt-2 w-full text-left text-sm">
              <tbody>
                {jspFares.map((fare) => (
                  <tr key={fare.id} className="border-b border-line">
                    <th scope="row" className="py-3 pr-4 font-normal">
                      {t(fare.labelKey)}
                    </th>
                    <td className="py-3 text-right">{fare.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-ink-soft">
              {t("confirm")} {t("fareCaptured", { date: transportLinks.fareListCaptured, checked: transportLinks.fareListChecked })}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <a className="inline-flex h-11 items-center text-copper" href={transportLinks.priceList}>
                {t("officialList")}
              </a>
              <a className="inline-flex h-11 items-center" href={transportLinks.planner}>
                {t("planner")}
              </a>
              <a className="inline-flex h-11 items-center" href={jspHow.faq}>
                {t("faq")}
              </a>
              <a className="inline-flex h-11 items-center" href={jspHow.announcements}>
                {t("announcements")}
              </a>
              <a className="inline-flex h-11 items-center" href={jspHow.webTickets}>
                {t("webTickets")}
              </a>
              <a className="inline-flex h-11 items-center" href={jspHow.playStore}>
                {t("playStore")}
              </a>
              <a className="inline-flex h-11 items-center" href={transportLinks.phone}>
                {t("phone")} {transportLinks.phoneDisplay}
              </a>
            </div>
            <h2 className="font-display text-3xl">{t("ammStopsTitle")}</h2>
            <p className="text-sm leading-relaxed text-ink-soft">{t("ammStopsBody")}</p>
            <ul className="divide-y divide-line border-y border-line text-sm">
              {ammPublishedStops.stops.map((stop) => (
                <li key={stop.name} className="flex justify-between gap-4 py-3">
                  <span>{stop.name}</span>
                  <span className="text-ink-soft">{stop.lines}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-brass">{t("lastChecked", { date: ammPublishedStops.lastChecked })}</p>
          </div>
        ) : null}
        {mode === "bicycle" ? (
          <div className="max-w-2xl space-y-4 leading-relaxed">
            <p>{t("bicycleBody")}</p>
            <p>{t("bicycleShare")}</p>
            <p>{t("bicycleShop")}</p>
          </div>
        ) : null}
        {mode === "scooter" ? (
          <div className="max-w-3xl space-y-6">
            <p className="leading-relaxed">{t("scooterIntro")}</p>
            <article className="border border-line p-5">
              <h2 className="font-display text-3xl">{t("enjoyTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed">{t("enjoyBody")}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>{t("enjoyStart", { amount: formatCount(enjoyTariff.startMkd, locale) })}</li>
                <li>{t("enjoyMinute", { amount: formatCount(enjoyTariff.perMinuteMkd, locale) })}</li>
                <li>{t("enjoyReserve", { amount: formatCount(enjoyTariff.reservationPer10MinMkd, locale) })}</li>
                <li>{t("enjoyPause", { amount: formatCount(enjoyTariff.pausePerMinuteMkd, locale) })}</li>
              </ul>
              <p className="mt-3 text-xs text-brass">{t("lastChecked", { date: enjoyTariff.lastChecked })}</p>
              <a className="mt-3 inline-flex h-11 items-center text-sm text-copper" href={enjoyTariff.url}>
                {t("enjoySource")}
              </a>
            </article>
            <article className="border border-line p-5">
              <h2 className="font-display text-3xl">{t("binbinTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed">{t("binbinBody")}</p>
              <a className="mt-3 inline-flex h-11 items-center text-sm text-copper" href={binbin.help}>
                {t("binbinSource")}
              </a>
              <p className="mt-2 text-xs text-brass">{t("lastChecked", { date: binbin.lastChecked })}</p>
            </article>
          </div>
        ) : null}
        {mode === "taxi" ? (
          <div className="max-w-2xl space-y-4 leading-relaxed">
            <p>{t("taxiBody")}</p>
            <article className="border border-line p-5">
              <h2 className="font-display text-3xl">{t("wiziTitle")}</h2>
              <p className="mt-3 text-sm">{t("wiziBody")}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>{t("wiziStart", { amount: formatCount(wiziTariff.startMkd, locale) })}</li>
                <li>{t("wiziKm", { amount: formatCount(wiziTariff.perKmMkd, locale) })}</li>
                <li>{t("wiziWait", { amount: formatCount(wiziTariff.waitingHourMkd, locale) })}</li>
              </ul>
              <p className="mt-3 text-sm">
                <a href={wiziTariff.tel}>{wiziTariff.phone}</a>
              </p>
              <a className="mt-2 inline-flex h-11 items-center text-sm text-copper" href={wiziTariff.url}>
                {t("wiziSource")}
              </a>
              <p className="text-xs text-brass">{t("lastChecked", { date: wiziTariff.lastChecked })}</p>
            </article>
            <p>{t("noRideHail")}</p>
            <p>{t("airportBody", { amount: airportTaxi.amount, distance: airportTaxi.distance })}</p>
          </div>
        ) : null}
        {mode === "compare" ? (
          <div className="max-w-3xl">
            <p className="leading-relaxed">{t("compareIntro")}</p>
            <table className="mt-6 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-3 font-normal">{t("compareMode")}</th>
                  <th className="py-3 font-normal">{t("comparePrice")}</th>
                  <th className="py-3 font-normal">{t("compareTime")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="py-3">{t("walk")}</td>
                  <td className="py-3">{t("compareWalkPrice")}</td>
                  <td className="py-3">{walkMin != null ? t("compareWalkTime", { minutes: walkMin }) : t("compareUnknown")}</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="py-3">{t("bus")}</td>
                  <td className="py-3">{t("compareBusPrice")}</td>
                  <td className="py-3">{t("compareBusTime")}</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="py-3">{t("scooter")}</td>
                  <td className="py-3">
                    {scooterQuote != null && scooterMinutes != null
                      ? t("compareScooterPrice", {
                          minutes: formatCount(scooterMinutes, locale),
                          amount: formatMkd(scooterQuote, locale).replace(" MKD", ""),
                        })
                      : t("compareUnknown")}
                  </td>
                  <td className="py-3">{t("compareScooterTime")}</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="py-3">{t("taxi")}</td>
                  <td className="py-3">
                    {taxi
                      ? t("compareTaxiPrice", {
                          km: formatCount(taxi.assumedRoadKm, locale),
                          amount: formatCount(taxi.mkd, locale),
                        })
                      : t("compareUnknown")}
                  </td>
                  <td className="py-3">{t("compareTaxiTime")}</td>
                </tr>
                <tr className="border-b border-line">
                  <td className="py-3">{t("bicycle")}</td>
                  <td className="py-3">{t("compareBikePrice")}</td>
                  <td className="py-3">{t("compareUnknown")}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 text-sm text-ink-soft">{t("compareAssumptions")}</p>
            {destination ? (
              <p className="mt-4 text-sm">
                <Link href={destination.href} className="text-copper">
                  {destination.name}
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
            <p className="mt-10 text-xs text-ink-soft">
              {t("museumsOnFoot", { count: formatCount(institutions().length, locale) })}
            </p>
    </div>
  );
}
