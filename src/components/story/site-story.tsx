import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { StoryHero } from "@/components/story/story-hero";
import { StoryLook } from "@/components/story/story-look";
import { StoryMap } from "@/components/story/story-map";
import { StoryTimeline } from "@/components/story/story-timeline";
import { pick } from "@/content/copy";
import { eventsAt, walksThrough } from "@/content/journeys";
import { getSite } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import type { ClaimKind } from "@/content/knowledge/schema";
import { getSource } from "@/content/knowledge/sources";
import { getVisitOps } from "@/content/knowledge/visit-ops";
import { openState } from "@/lib/visit/hours";
import { getPlace, places, sitePath } from "@/content/places";
import type { Place } from "@/content/types";
import { Link } from "@/i18n/navigation";

const kindKey: Record<ClaimKind, "fact" | "legend" | "interpretation" | "unverified"> = {
  "documented-fact": "fact",
  "legend-folklore": "legend",
  interpretation: "interpretation",
  unverified: "unverified",
};

const kindClass: Record<ClaimKind, string> = {
  "documented-fact": "cs-claim-fact",
  "legend-folklore": "cs-claim-legend",
  interpretation: "cs-claim-interp",
  unverified: "cs-claim-unverified",
};

export async function SiteStory({ place, locale }: { place: Place; locale: string }) {
  const site = getSite(place.slug);
  const t = await getTranslations("common");
  const story = await getTranslations("story");
  const evidence = await getTranslations("evidence");
  const detail = await getTranslations("detail");
  const museums = await getTranslations("museums");
  const ops = getVisitOps(place.slug);
  const hoursNow = openState(ops?.windows);
  const index = String(places.findIndex((item) => item.slug === place.slug) + 1).padStart(2, "0");
  const related = place.related.flatMap((slug) => {
    const next = getPlace(slug);
    return next ? [next] : [];
  });
  const walks = walksThrough(place.slug);
  const programmes = eventsAt(place.slug);
  const images = (site?.images ?? []).flatMap((id) => {
    const asset = getMedia(id);
    return asset ? [asset] : [];
  });
  const hero = images[0];
  const lookNotes = [
    site?.architecturalStyle ? pick(site.architecturalStyle, locale) : "",
    site?.architecturalFeatures ? pick(site.architecturalFeatures, locale) : "",
    site?.creator ? pick(site.creator, locale) : "",
  ].filter(Boolean);
  const continuePlace = related[0];
  const osm = `https://www.openstreetmap.org/?mlat=${place.coordinates.lat}&mlon=${place.coordinates.lng}#map=18/${place.coordinates.lat}/${place.coordinates.lng}`;
  const sourceIds = [
    ...new Set(
      [
        site?.coordinateSourceId,
        ...(site?.claims.flatMap((claim) => claim.sourceIds) ?? []),
        ...(site?.myths.flatMap((claim) => claim.sourceIds) ?? []),
        ...(site?.milestones.flatMap((item) => item.sourceIds) ?? []),
      ].filter(Boolean) as string[],
    ),
  ];
  const registry = sourceIds.flatMap((id) => {
    const source = getSource(id);
    return source ? [source] : [];
  });
  const kindLabels = {
    "documented-fact": evidence("fact"),
    "legend-folklore": evidence("legend"),
    interpretation: evidence("interpretation"),
    unverified: evidence("unverified"),
  } as const;
  const mapMarkers = [
    {
      id: place.slug,
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      label: pick(place.name, locale),
      tone: place.municipality === "nearby" ? ("nearby" as const) : ("site" as const),
    },
    ...related.map((item) => ({
      id: item.slug,
      lat: item.coordinates.lat,
      lng: item.coordinates.lng,
      label: pick(item.name, locale),
      tone: item.municipality === "nearby" ? ("nearby" as const) : ("site" as const),
    })),
  ];
  const hrefs = Object.fromEntries(
    [place, ...related].map((item) => [item.slug, sitePath(item)]),
  );

  return (
    <article className="cs-story pb-16">
      <StoryHero
        image={hero}
        imageAlt={hero ? pick(hero.caption, locale) : pick(place.name, locale)}
        credit={
          hero
            ? `${story("heroCredit")}: ${hero.credit} · ${hero.license}`
            : undefined
        }
        index={index}
        motif={place.motif}
        palette={place.palette}
        title={pick(place.name, locale)}
        eyebrow={pick(place.eyebrow, locale)}
        noPhotograph={story("noPhotograph")}
      />

      <header className="mx-auto max-w-6xl px-5 pt-10 lg:px-8 lg:pt-14">
        <Reveal>
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">{pick(place.eyebrow, locale)}</p>
          {place.municipality === "nearby" ? (
            <p className="mt-2 text-[11px] tracking-[0.16em] text-copper uppercase">{t("nearby")}</p>
          ) : null}
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.9] sm:text-7xl lg:text-8xl">
            {pick(place.name, locale)}
          </h1>
        </Reveal>
        <Reveal delay={0.08} className="mt-8 grid gap-8 border-t border-line pt-8 lg:grid-cols-12">
          <p className="font-display text-2xl leading-snug text-ink-soft lg:col-span-7">
            {pick(place.summary, locale)}
          </p>
          <dl className="space-y-4 text-sm lg:col-span-5">
            <div>
              <dt className="text-[11px] tracking-[0.16em] text-brass uppercase">{story("period")}</dt>
              <dd className="mt-1">{pick(site?.historicalPeriod ?? place.era, locale)}</dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-[0.16em] text-brass uppercase">{story("locationLine")}</dt>
              <dd className="mt-1">{pick(place.address, locale)}</dd>
            </div>
            {site?.commemorates ? (
              <div>
                <dt className="text-[11px] tracking-[0.16em] text-brass uppercase">{story("commemorates")}</dt>
                <dd className="mt-1">{pick(site.commemorates, locale)}</dd>
              </div>
            ) : null}
          </dl>
        </Reveal>
      </header>

      <nav
        className="sticky top-16 z-30 mt-10 border-y border-line bg-paper/95 lg:top-20"
        aria-label={story("chapters")}
      >
        <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 py-3 text-[11px] tracking-[0.16em] uppercase lg:px-8">
          <a href="#story">{story("narrative")}</a>
          <a href="#timeline">{story("timeline")}</a>
          <a href="#legends">{story("myths")}</a>
          <a href="#architecture">{story("architecture")}</a>
          <a href="#context">{story("context")}</a>
          <a href="#location">{story("location")}</a>
          <a href="#sources">{story("sources")}</a>
        </div>
      </nav>

      <section id="story" className="cs-story-section mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">01</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{story("narrative")}</h2>
        </Reveal>
        <Reveal delay={0.05} className="mt-8 max-w-3xl">
          <p className="font-display text-3xl leading-snug">{pick(place.story[0], locale)}</p>
          <p className="mt-8 text-lg leading-relaxed">{pick(place.story[1], locale)}</p>
          {site?.significance ? (
            <p className="mt-8 text-base leading-relaxed text-ink-soft">{pick(site.significance, locale)}</p>
          ) : null}
          {place.collection ? (
            <p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-ink-soft">
              {pick(place.collection, locale)}
            </p>
          ) : null}
        </Reveal>
        {site && site.claims.length > 0 ? (
          <ul className="mt-12 grid gap-4 lg:grid-cols-2">
            {site.claims.map((claim) => (
              <li key={claim.id} className={`border border-line bg-foam p-5 ${kindClass[claim.kind]}`}>
                <p className="text-[11px] tracking-[0.16em] text-brass uppercase">{evidence(kindKey[claim.kind])}</p>
                <p className="mt-3 text-sm leading-relaxed">{pick(claim.text, locale)}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section id="timeline" className="cs-story-section border-y border-line bg-foam/60 py-16">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Reveal>
            <p className="text-[11px] tracking-[0.22em] text-brass uppercase">02</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">{story("timeline")}</h2>
          </Reveal>
          <div className="mt-10">
            <StoryTimeline
              items={site?.milestones ?? []}
              locale={locale}
              empty={story("timelineEmpty")}
              uncertain={story("uncertainDate")}
              labels={kindLabels}
            />
          </div>
        </div>
      </section>

      <section id="legends" className="cs-story-section mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">03</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{story("myths")}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{story("mythsLead")}</p>
        </Reveal>
        <ul className="mt-10 space-y-5">
          {(site?.myths ?? []).map((claim) => (
            <li key={claim.id} className={`border border-line bg-foam p-6 ${kindClass[claim.kind]}`}>
              <p className="text-[11px] tracking-[0.16em] text-brass uppercase">{evidence(kindKey[claim.kind])}</p>
              <p className="mt-3 max-w-3xl text-base leading-relaxed">{pick(claim.text, locale)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="architecture" className="cs-story-section border-y border-line py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-[11px] tracking-[0.22em] text-brass uppercase">04</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">{story("architecture")}</h2>
            </Reveal>
            {site?.architecturalStyle ? (
              <p className="mt-8">
                <span className="block text-[11px] tracking-[0.16em] text-brass uppercase">{story("style")}</span>
                <span className="mt-2 block font-display text-2xl leading-snug">
                  {pick(site.architecturalStyle, locale)}
                </span>
              </p>
            ) : null}
            {site?.creator ? (
              <p className="mt-6 text-sm leading-relaxed">
                <span className="block text-[11px] tracking-[0.16em] text-brass uppercase">{story("creator")}</span>
                <span className="mt-2 block">{pick(site.creator, locale)}</span>
              </p>
            ) : null}
            {site?.architecturalFeatures ? (
              <p className="mt-6 text-base leading-relaxed">{pick(site.architecturalFeatures, locale)}</p>
            ) : null}
            {!site?.architecturalStyle && !site?.architecturalFeatures && !site?.creator ? (
              <p className="mt-8 max-w-md text-base leading-relaxed text-ink-soft">{story("architectureEmpty")}</p>
            ) : null}
          </div>
          <div className="lg:col-span-7">
            {hero && lookNotes.length > 0 ? (
              <StoryLook
                image={hero}
                alt={pick(hero.caption, locale)}
                credit={`${hero.credit} · ${hero.license}`}
                notes={lookNotes}
                openLabel={story("lookCloser")}
                hideLabel={story("lookCloserHide")}
                lead={story("lookCloserLead")}
              />
            ) : images[0] ? (
              <figure className="border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0].url} alt={pick(images[0].caption, locale)} className="aspect-[16/10] w-full object-cover" />
                <figcaption className="px-4 py-3 text-xs text-ink-soft">
                  {images[0].credit} · {images[0].license}
                </figcaption>
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      <section id="context" className="cs-story-section mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">05</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{story("context")}</h2>
        </Reveal>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {related.map((item) => (
            <li key={item.slug}>
              <Link href={sitePath(item)} className="block border border-line p-4">
                <span className="block text-[11px] tracking-[0.16em] text-brass uppercase">
                  {pick(item.eyebrow, locale)}
                </span>
                {item.municipality === "nearby" ? (
                  <span className="mt-1 block text-[11px] tracking-[0.16em] text-copper uppercase">{t("nearby")}</span>
                ) : null}
                <span className="mt-2 block font-display text-2xl leading-none">{pick(item.name, locale)}</span>
              </Link>
            </li>
          ))}
        </ul>
        {continuePlace ? (
          <p className="mt-10">
            <Link href={sitePath(continuePlace)} className="inline-flex h-12 items-center bg-ink px-5 text-sm text-foam">
              {story("continue")} — {pick(continuePlace.name, locale)}
            </Link>
          </p>
        ) : null}
        {programmes.length > 0 ? (
          <div className="mt-12">
            <h3 className="font-display text-3xl">{detail("events")}</h3>
            <ul className="mt-4">
              {programmes.map((event) => (
                <li key={event.slug}>
                  <Link href={`/events/${event.slug}`} className="inline-flex h-12 items-center font-display text-2xl">
                    {pick(event.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section id="location" className="cs-story-section border-y border-line bg-foam/50 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-[11px] tracking-[0.22em] text-brass uppercase">06</p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">{story("location")}</h2>
            </Reveal>
            <p className="mt-6 text-sm leading-relaxed">{pick(place.visit, locale)}</p>
            {ops ? (
              <div className="mt-4 space-y-2 text-sm">
                {hoursNow.computed ? (
                  <p className="text-copper">{hoursNow.open ? museums("openToday") : museums("closedToday")}</p>
                ) : (
                  <p className="text-ink-soft">{museums("noOpenToday")}</p>
                )}
                <p>{pick(ops.timetable, locale)}</p>
                {ops.lastAdmission ? <p>{pick(ops.lastAdmission, locale)}</p> : null}
                {ops.tickets ? <p>{pick(ops.tickets, locale)}</p> : null}
                {ops.accessibility ? <p>{pick(ops.accessibility, locale)}</p> : null}
                <p className="text-xs text-brass">{museums("verifiedOn", { date: ops.lastChecked })}</p>
              </div>
            ) : null}
            {site?.visitor?.hours ? <p className="mt-4 text-sm">{pick(site.visitor.hours, locale)}</p> : null}
            {site?.visitor?.tickets ? <p className="mt-2 text-sm">{pick(site.visitor.tickets, locale)}</p> : null}
            {site?.visitor?.notes ? (
              <p className="mt-2 text-sm text-ink-soft">{pick(site.visitor.notes, locale)}</p>
            ) : null}
            <p className="mt-6 text-sm">
              <span className="block text-[11px] tracking-[0.16em] text-brass uppercase">{t("address")}</span>
              {pick(place.address, locale)}
            </p>
            <p className="mt-4 text-sm text-ink-soft">
              {place.walkMinutes === 0 ? t("atSquare") : t("walk", { minutes: place.walkMinutes })}
            </p>
            <p className="mt-4 text-xs text-ink-soft">
              {story("coordinates")}: {place.coordinates.lat.toFixed(5)}, {place.coordinates.lng.toFixed(5)}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href={`/?place=${place.slug}`} className="inline-flex h-11 items-center text-copper">
                {story("openAtlas")}
              </Link>
              <a className="inline-flex h-11 items-center" href={osm} target="_blank" rel="noreferrer">
                {t("osm")}
              </a>
            </div>
            {walks.length > 0 ? (
              <div className="mt-10">
                <h3 className="font-display text-3xl">{story("addRoute")}</h3>
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {walks.map((walk) => (
                    <li key={walk.slug} className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <Link href={`/routes/${walk.slug}`} className="font-display text-2xl">
                        {pick(walk.name, locale)}
                      </Link>
                      <Link href={`/?walk=${walk.slug}`} className="text-sm text-copper">
                        {story("makeItinerary")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="lg:col-span-7">
            <StoryMap markers={mapMarkers} selectedId={place.slug} label={story("location")} hrefs={hrefs} />
          </div>
        </div>
      </section>

      <section id="sources" className="cs-story-section mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Reveal>
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">07</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl">{story("sources")}</h2>
          <p className="mt-4 max-w-2xl text-sm text-ink-soft">{evidence("sourcesNote")}</p>
        </Reveal>
        {place.municipality === "nearby" && place.nearbyNote ? (
          <p className="mt-8 border border-line bg-paper-2 px-4 py-3 text-sm">{pick(place.nearbyNote, locale)}</p>
        ) : null}
        {place.boundaryNote ? <p className="mt-4 text-sm text-ink-soft">{pick(place.boundaryNote, locale)}</p> : null}
        {images.length > 0 ? (
          <div className="mt-10">
            <h3 className="font-display text-3xl">{story("photographs")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {images.map((image) => (
                <li key={image.id}>
                  {image.credit} · {image.license}
                  {image.attributionRequired ? ` · ${evidence("attribution")}` : ""} ·{" "}
                  <a href={image.pageUrl} target="_blank" rel="noreferrer" className="text-copper">
                    {evidence("source")}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {registry.map((source) => (
            <li key={source.id} className="py-3 text-sm">
              <p className="font-medium">{source.title}</p>
              <p className="text-ink-soft">
                {source.publisher} · {evidence("accessed")} {source.accessed}
              </p>
              {source.url ? (
                <a href={source.url} className="text-copper" target="_blank" rel="noreferrer">
                  {source.url}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        {site ? (
          <p className="mt-4 text-xs text-ink-soft">
            {evidence("verified")} {site.lastChecked} · {evidence(site.verificationStatus)}
          </p>
        ) : null}
      </section>
    </article>
  );
}
