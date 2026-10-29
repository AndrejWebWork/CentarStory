"use client";

import { ArrowDown, ArrowUp, Navigation, Plus, Route, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { pick } from "@/content/copy";
import { getSite, sites } from "@/content/knowledge/catalog";
import { getPlace, sitePath } from "@/content/places";
import { Link } from "@/i18n/navigation";
import { explainLegs } from "@/lib/graph/query";
import { ITINERARY_THEMES, planItinerary, type ItineraryPlan } from "@/lib/itinerary";
import { pedestrianNavigation } from "@/lib/mapping/walk";
import type { WalkPath } from "@/lib/mapping/walk";

function themeKey(id: string) {
  return `theme_${id.replace(/[:.-]/g, "_")}`;
}

export function RouteBuilder({
  selectedSlug,
  user,
  onApply,
  onClear,
  path,
  pathStatus,
}: {
  selectedSlug: string | null;
  user: { lat: number; lng: number } | null;
  onApply: (slugs: string[]) => void;
  onClear: () => void;
  path: WalkPath | null;
  pathStatus: "idle" | "loading" | "ready";
}) {
  const t = useTranslations("explore");
  const locale = useLocale();
  const [startMode, setStartMode] = useState<"site" | "gps">("site");
  const [startSlug, setStartSlug] = useState(selectedSlug ?? "macedonia-square");
  const [themeId, setThemeId] = useState(ITINERARY_THEMES[0]?.id ?? "skopje-2014");
  const [budget, setBudget] = useState<"45" | "90" | "180" | "3" | "5" | "7">("90");
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [slugs, setSlugs] = useState<string[]>([]);

  const mapped = useMemo(
    () => sites.filter((site) => Number.isFinite(site.coordinates.lat)),
    [],
  );

  const legs = useMemo(() => (slugs.length > 1 ? explainLegs(slugs) : []), [slugs]);
  const points = slugs
    .map((slug) => getSite(slug)?.coordinates)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const nav = pedestrianNavigation(points);

  function generate() {
    const next = planItinerary({
      start:
        startMode === "gps" && user
          ? { kind: "gps", lat: user.lat, lng: user.lng }
          : { kind: "site", slug: startSlug },
      themeId,
      budget:
        budget === "45" || budget === "90" || budget === "180"
          ? { mode: "duration", minutes: Number(budget) as 45 | 90 | 180 }
          : { mode: "stops", count: Number(budget) as 3 | 5 | 7 },
    });
    setPlan(next);
    setSlugs(next.stops.map((stop) => stop.slug));
    onApply(next.stops.map((stop) => stop.slug));
  }

  function setOrder(next: string[]) {
    setSlugs(next);
    onApply(next);
  }

  const extras = mapped.filter((site) => !slugs.includes(site.slug));

  return (
    <section className="border border-line bg-foam p-4" aria-labelledby="route-builder-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="route-builder-title" className="font-display text-3xl leading-none">
          {t("buildRoute")}
        </h2>
        <Route className="size-5 text-copper" aria-hidden="true" />
      </div>
      <fieldset className="mt-4">
        <legend className="text-[11px] tracking-[0.16em] text-brass uppercase">{t("routeStart")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={startMode === "site"}
            className={`h-11 border px-3 text-sm ${startMode === "site" ? "border-ink bg-ink text-foam" : "border-line"}`}
            onClick={() => setStartMode("site")}
          >
            {t("startSite")}
          </button>
          <button
            type="button"
            aria-pressed={startMode === "gps"}
            disabled={!user}
            className={`h-11 border px-3 text-sm disabled:opacity-40 ${startMode === "gps" ? "border-ink bg-ink text-foam" : "border-line"}`}
            onClick={() => setStartMode("gps")}
          >
            {t("startGps")}
          </button>
        </div>
        {startMode === "site" ? (
          <label className="mt-3 block text-sm">
            <span className="sr-only">{t("startSite")}</span>
            <select
              className="mt-1 h-11 w-full border border-line bg-paper px-3"
              value={startSlug}
              onChange={(event) => setStartSlug(event.target.value)}
            >
              {mapped.map((site) => (
                <option key={site.slug} value={site.slug}>
                  {pick(site.officialName, locale)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </fieldset>
      <label className="mt-4 block text-sm">
        <span className="text-[11px] tracking-[0.16em] text-brass uppercase">{t("routeTheme")}</span>
        <select
          className="mt-1 h-11 w-full border border-line bg-paper px-3"
          value={themeId}
          onChange={(event) => setThemeId(event.target.value)}
        >
          {ITINERARY_THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {t(themeKey(theme.id))}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="mt-4">
        <legend className="text-[11px] tracking-[0.16em] text-brass uppercase">{t("routeBudget")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["45", "90", "180", "3", "5", "7"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={budget === item}
              className={`h-11 border px-3 text-sm ${budget === item ? "border-ink bg-ink text-foam" : "border-line"}`}
              onClick={() => setBudget(item)}
            >
              {item === "45" || item === "90" || item === "180"
                ? t(`duration${item}`)
                : t(`stops${item}`)}
            </button>
          ))}
        </div>
      </fieldset>
      <button type="button" className="mt-4 h-12 w-full bg-copper text-foam" onClick={generate}>
        {t("generate")}
      </button>
      {plan ? (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm text-ink-soft">
            {t("stopCount", { count: slugs.length })}
            {pathStatus === "loading" ? ` · ${t("routeLoading")}` : null}
            {path?.source === "street" && path.minutes && path.meters
              ? ` · ${t("streetMeters", { minutes: path.minutes, meters: path.meters })}`
              : null}
            {path?.source === "direct" ? ` · ${t("approxNote")}` : null}
            {path?.source === "direct" && path.meters
              ? ` · ${t("approxMeters", { meters: path.meters })}`
              : null}
            {path?.source !== "street" && plan.estimatedMinutes
              ? ` · ${t("planningEstimate", { minutes: plan.estimatedMinutes })}`
              : null}
          </p>
          {plan.warnings.map((warning, index) => (
            <p key={index} className="mt-2 text-sm text-copper">
              {pick(warning, locale)}
            </p>
          ))}
          <ol className="mt-4 divide-y divide-line border-y border-line">
            {slugs.map((slug, index) => {
              const site = getSite(slug);
              const stop = plan.stops.find((item) => item.slug === slug);
              const leg = index > 0 ? legs[index - 1] : null;
              if (!site) return null;
              return (
                <li key={`${slug}-${index}`} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-2xl leading-none">
                        <span className="mr-2 text-brass">{String(index + 1).padStart(2, "0")}</span>
                        {pick(site.officialName, locale)}
                      </p>
                      {leg ? (
                        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                          <span className="text-[11px] tracking-[0.14em] text-brass uppercase">
                            {leg.historical ? t("historicalWhy") : t("practicalWhy")}
                          </span>
                          <span className="mt-1 block">{pick(leg.explanation, locale)}</span>
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-ink-soft">{t("whyStart")}</p>
                      )}
                      {stop?.likelyClosedToday && stop.openingNote ? (
                        <p className="mt-2 text-sm text-copper">{pick(stop.openingNote, locale)}</p>
                      ) : null}
                      {getPlace(slug) ? (
                        <Link href={sitePath(getPlace(slug)!)} className="mt-2 inline-flex h-10 items-center text-sm text-copper">
                          {t("openStory")}
                        </Link>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button type="button" className="grid size-11 place-items-center border border-line" aria-label={t("moveUp")} disabled={index === 0} onClick={() => setOrder(swap(slugs, index, index - 1))}>
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" className="grid size-11 place-items-center border border-line" aria-label={t("moveDown")} disabled={index === slugs.length - 1} onClick={() => setOrder(swap(slugs, index, index + 1))}>
                        <ArrowDown className="size-4" />
                      </button>
                      <button type="button" className="grid size-11 place-items-center border border-line" aria-label={t("removeStop")} disabled={slugs.length < 3} onClick={() => setOrder(slugs.filter((_, i) => i !== index))}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {extras.length ? (
            <label className="mt-3 block text-sm">
              <span className="text-[11px] tracking-[0.16em] text-brass uppercase">{t("addStop")}</span>
              <span className="mt-1 flex gap-2">
                <select id="add-stop" className="h-11 flex-1 border border-line bg-paper px-3" defaultValue="">
                  <option value="" disabled>
                    {t("addStop")}
                  </option>
                  {extras.map((site) => (
                    <option key={site.slug} value={site.slug}>
                      {pick(site.officialName, locale)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="grid size-11 place-items-center border border-line"
                  aria-label={t("addStop")}
                  onClick={() => {
                    const select = document.getElementById("add-stop") as HTMLSelectElement | null;
                    const value = select?.value;
                    if (!value) return;
                    setOrder([...slugs, value]);
                  }}
                >
                  <Plus className="size-4" />
                </button>
              </span>
            </label>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            {nav.osm ? (
              <a href={nav.osm} className="inline-flex h-11 items-center gap-2 border border-line px-3 text-sm" target="_blank" rel="noreferrer">
                <Navigation className="size-4" aria-hidden="true" />
                {t("navOsm")}
              </a>
            ) : null}
            {nav.google ? (
              <a href={nav.google} className="inline-flex h-11 items-center gap-2 border border-line px-3 text-sm" target="_blank" rel="noreferrer">
                {t("navGoogle")}
              </a>
            ) : null}
            <button type="button" className="h-11 text-sm text-copper underline" onClick={() => { setPlan(null); setSlugs([]); onClear(); }}>
              {t("clearRoute")}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function swap(list: string[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const item = next[from];
  next[from] = next[to];
  next[to] = item;
  return next;
}
