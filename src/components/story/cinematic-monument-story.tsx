import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/motion/reveal";
import { CinematicEntry } from "@/components/story/cinematic-entry";
import { ScanScrollTheater } from "@/components/story/scan-scroll-theater";
import {
  AnimatedTimelineScene,
  ContinueJourneyItinerary,
  TimelineToMapScene,
  type ConnectedConnectionItem,
} from "@/components/story/cinematic-scenes";
import { StoryHero } from "@/components/story/story-hero";
import { StoryLook } from "@/components/story/story-look";
import { StoryMap } from "@/components/story/story-map";
import { pick } from "@/content/copy";
import { eventsAt, walksThrough } from "@/content/journeys";
import { getSite } from "@/content/knowledge/catalog";
import { getMedia } from "@/content/knowledge/media";
import type { ClaimKind } from "@/content/knowledge/schema";
import { getSource } from "@/content/knowledge/sources";
import { getVisitOps } from "@/content/knowledge/visit-ops";
import { getPlace, places, sitePath } from "@/content/places";
import type { Place } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { explainLeg } from "@/lib/graph/query";
import { chronicleCast } from "@/lib/story/chronicle-cast";
import { filmFacts, filmKindFor } from "@/lib/story/cinematic-register";
import { monumentTone } from "@/lib/story/monument-tone";
import { openState } from "@/lib/visit/hours";

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

export async function CinematicMonumentStory({
  place,
  locale,
  cinematic = false,
}: {
  place: Place;
  locale: string;
  cinematic?: boolean;
}) {
  const site = getSite(place.slug);
  const t = await getTranslations("common");
  const story = await getTranslations("story");
  const evidence = await getTranslations("evidence");
  const detail = await getTranslations("detail");
  const museums = await getTranslations("museums");
  const explore = await getTranslations("explore");
  const scan = await getTranslations("scan");
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
  const hrefs = Object.fromEntries([place, ...related].map((item) => [item.slug, sitePath(item)]));
  const chronicle = cinematic ? chronicleCast(place, locale) : [];
  const filmKind = filmKindFor(place);
  const facts = filmFacts(place, locale);
  const tone = monumentTone(place.slug, place.motif);
  const filmKicker =
    filmKind === "museum"
      ? story("museumKicker")
      : filmKind === "memorial"
        ? story("memorialKicker")
        : filmKind === "civic"
          ? story("civicKicker")
          : filmKind === "ottoman"
            ? story("ottomanKicker")
            : filmKind === "fortress"
              ? story("fortressKicker")
              : story("chronicleKicker");

  const timelineItems = (site?.milestones ?? []).map((item) => ({
    ...item,
    labelText: pick(item.label, locale),
  }));

  const connectionItems: ConnectedConnectionItem[] = related.map((item) => {
    const leg = explainLeg(place.slug, item.slug);
    const relSite = getSite(item.slug);
    const relImage = relSite?.images[0] ? getMedia(relSite.images[0]) : undefined;
    return {
      slug: item.slug,
      name: pick(item.name, locale),
      eyebrow: pick(item.eyebrow, locale),
      href: sitePath(item),
      coordinates: item.coordinates,
      municipality: item.municipality,
      historical: leg.historical,
      relationBadge: leg.historical ? explore("historicalWhy") : explore("practicalWhy"),
      explanation: pick(leg.explanation, locale),
      motif: item.motif,
      palette: item.palette,
      image: relImage,
      imageAlt: relImage ? pick(relImage.caption, locale) : pick(item.name, locale),
    };
  });

  const journeyStops = [place, ...related.slice(0, 3)].map((item) => ({
    slug: item.slug,
    name: pick(item.name, locale),
    href: sitePath(item),
    coordinates: item.coordinates,
  }));

  return (
    <article className={cinematic ? "cs-story cs-story-cinematic" : "cs-story"}>
      <CinematicEntry
        active={cinematic}
        index={index}
        eyebrow={pick(place.eyebrow, locale)}
        title={pick(place.name, locale)}
        era={pick(site?.historicalPeriod ?? place.era, locale)}
        coordinates={`${place.coordinates.lat.toFixed(4)}°N · ${place.coordinates.lng.toFixed(4)}°E`}
        accent={tone.accent}
        washA={tone.washA}
        washB={tone.washB}
      />

      {/* SCENE 1 — THE MONUMENT */}
      <StoryHero
        image={hero}
        imageAlt={hero ? pick(hero.caption, locale) : pick(place.name, locale)}
        index={index}
        motif={place.motif}
        palette={place.palette}
        title={pick(place.name, locale)}
        eyebrow={pick(place.eyebrow, locale)}
        noPhotograph={story("noPhotograph")}
        cinematic={cinematic}
        slug={place.slug}
        scanLabel={scan("previewAlt")}
        scrollLabel={cinematic ? story("scrollDown") : undefined}
      />

      {cinematic ? (
        <ScanScrollTheater
          figures={chronicle}
          lead={pick(place.story[0], locale)}
          second={pick(place.story[1], locale)}
          scrollLabel={story("scrollDown")}
          kicker={filmKicker}
          roleLabels={{
            rider: story("riderRole"),
            warrior: story("warriorRole"),
            place: story("companyRole"),
            house: story("houseRole"),
          }}
          filmKind={filmKind}
          year={facts.year}
          yearShort={facts.yearShort}
          architecture={facts.architecture || facts.style}
          yearLabel={story("yearLabel")}
          architectureLabel={story("architectureLabel")}
          washA={tone.washA}
          washB={tone.washB}
          accent={tone.accent}
        />
      ) : null}

      <div className="border-b border-ink bg-foam">
        <div className="mx-auto grid max-w-[96rem] gap-8 px-4 py-10 sm:px-5 sm:py-12 lg:grid-cols-12 lg:px-8 lg:py-16">
          <div className="lg:col-span-7">
            <p className="text-[10px] tracking-[0.22em] text-brass uppercase">
              Folio {index} · {place.coordinates.lat.toFixed(4)}°N · {place.coordinates.lng.toFixed(4)}°E
            </p>
            <p className="mt-3 font-display text-3xl leading-snug text-ink sm:text-4xl">
              {pick(place.summary, locale)}
            </p>
          </div>
          <dl className="grid gap-5 border-t border-ink pt-5 text-sm lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            {place.municipality === "nearby" ? (
              <div>
                <dt className="text-[10px] tracking-[0.22em] text-copper uppercase">{t("nearby")}</dt>
              </div>
            ) : null}
            <div>
              <dt className="text-[10px] tracking-[0.22em] text-brass uppercase">{story("period")}</dt>
              <dd className="mt-1 font-display text-2xl">{pick(site?.historicalPeriod ?? place.era, locale)}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.22em] text-brass uppercase">{story("locationLine")}</dt>
              <dd className="mt-1">{pick(place.address, locale)}</dd>
            </div>
            {site?.commemorates ? (
              <div>
                <dt className="text-[10px] tracking-[0.22em] text-brass uppercase">{story("commemorates")}</dt>
                <dd className="mt-1">{pick(site.commemorates, locale)}</dd>
              </div>
            ) : null}
            {site?.materials ? (
              <div>
                <dt className="text-[10px] tracking-[0.22em] text-brass uppercase">
                  {site.monumentCategory ?? site.entityType}
                </dt>
                <dd className="mt-1 text-ink-soft">{pick(site.materials, locale)}</dd>
              </div>
            ) : null}
            {site?.missingOrDisputed ? (
              <div className="border-l-2 border-copper pl-3">
                <dt className="text-[10px] tracking-[0.22em] text-copper uppercase">
                  {evidence(site.verificationStatus)}
                </dt>
                <dd className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {pick(site.missingOrDisputed, locale)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <nav
        className="sticky top-14 z-30 border-b border-ink bg-paper/95 lg:top-[4.4rem]"
        aria-label={story("chapters")}
      >
        <div className="cs-no-scrollbar mx-auto flex max-w-[96rem] gap-5 overflow-x-auto px-4 py-3 text-[11px] tracking-[0.18em] whitespace-nowrap uppercase sm:px-5 lg:px-8">
          <a href="#story" className="hover:text-cobalt">01 · {story("narrative")}</a>
          <a href="#timeline" className="hover:text-cobalt">02 · {story("timeline")}</a>
          <a href="#legends" className="hover:text-cobalt">03 · {story("myths")}</a>
          <a href="#architecture" className="hover:text-cobalt">04 · {story("architecture")}</a>
          <a href="#context" className="hover:text-cobalt">05 · {story("context")}</a>
          <a href="#location" className="hover:text-cobalt">06 · {story("location")}</a>
          <a href="#sources" className="hover:text-cobalt">07 · {story("sources")}</a>
        </div>
      </nav>

      {/* SCENE 2 — THE HISTORICAL NARRATIVE */}
      <section id="story" className="cs-story-section mx-auto max-w-[96rem] px-4 py-16 sm:px-5 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="cs-kicker">01 — {story("narrative")}</p>
            <h2 className="mt-3 font-display text-4xl leading-[0.88] sm:text-6xl">{story("narrative")}</h2>
          </Reveal>
          <div className="space-y-8 lg:col-span-8">
            <Reveal delay={0.04}>
              <p className="border-l-2 border-cobalt pl-4 font-display text-3xl leading-snug sm:text-4xl">
                {pick(place.story[0], locale)}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-3xl text-lg leading-relaxed">{pick(place.story[1], locale)}</p>
            </Reveal>
            {site?.significance ? (
              <Reveal delay={0.12}>
                <p className="max-w-3xl text-base leading-relaxed text-ink-soft">
                  {pick(site.significance, locale)}
                </p>
              </Reveal>
            ) : null}
            {place.collection ? (
              <Reveal delay={0.14}>
                <p className="max-w-3xl border-t border-ink pt-6 text-sm leading-relaxed text-ink-soft">
                  {pick(place.collection, locale)}
                </p>
              </Reveal>
            ) : null}
          </div>
        </div>
        {site && site.claims.length > 0 ? (
          <ul className="mt-14 grid gap-4 border-t border-ink pt-10 lg:grid-cols-2">
            {site.claims.map((claim) => (
              <li key={claim.id} className={`border border-ink bg-foam p-5 sm:p-6 ${kindClass[claim.kind]}`}>
                <p className="text-[10px] tracking-[0.22em] text-brass uppercase">{evidence(kindKey[claim.kind])}</p>
                <p className="mt-3 text-sm leading-relaxed">{pick(claim.text, locale)}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* SCENE 3 — THE TIMELINE */}
      <section id="timeline" className="cs-story-section border-y border-ink bg-paper-2 py-16 sm:py-20">
        <div className="mx-auto max-w-[96rem] px-4 sm:px-5 lg:px-8">
          <Reveal>
            <p className="cs-kicker">02 — {story("timeline")}</p>
            <h2 className="mt-3 font-display text-4xl sm:text-7xl">{story("timeline")}</h2>
          </Reveal>
          <div className="mt-10 sm:mt-12">
            <AnimatedTimelineScene
              items={timelineItems}
              empty={story("timelineEmpty")}
              uncertain={story("uncertainDate")}
              labels={kindLabels}
              heroImage={hero}
              heroAlt={hero ? pick(hero.caption, locale) : pick(place.name, locale)}
            />
          </div>
        </div>
      </section>

      {/* MYTHS & LEGENDS (SEPARATED FROM DOCUMENTED FACTS) */}
      <section id="legends" className="cs-story-section mx-auto max-w-[96rem] px-4 py-16 sm:px-5 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="cs-kicker">03 — {story("myths")}</p>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl">{story("myths")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{story("mythsLead")}</p>
          </Reveal>
          <ul className="space-y-4 lg:col-span-8">
            {(site?.myths ?? []).map((claim) => (
              <li key={claim.id} className={`border border-ink bg-foam p-5 sm:p-6 ${kindClass[claim.kind]}`}>
                <p className="text-[10px] tracking-[0.22em] text-brass uppercase">{evidence(kindKey[claim.kind])}</p>
                <p className="mt-3 text-base leading-relaxed">{pick(claim.text, locale)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ARCHITECTURE & SYMBOLISM */}
      <section id="architecture" className="cs-story-section border-y border-ink bg-ink py-16 text-foam sm:py-20">
        <div className="mx-auto grid max-w-[96rem] gap-10 px-4 sm:px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="cs-kicker text-brass">04 — {story("architecture")}</p>
              <h2 className="mt-3 font-display text-4xl sm:text-6xl">{story("architecture")}</h2>
            </Reveal>
            {site?.architecturalStyle ? (
              <p className="mt-8">
                <span className="block text-[10px] tracking-[0.22em] text-brass uppercase">{story("style")}</span>
                <span className="mt-2 block font-display text-3xl leading-snug">
                  {pick(site.architecturalStyle, locale)}
                </span>
              </p>
            ) : null}
            {site?.creator ? (
              <p className="mt-6 text-sm leading-relaxed">
                <span className="block text-[10px] tracking-[0.22em] text-brass uppercase">{story("creator")}</span>
                <span className="mt-2 block text-foam/85">{pick(site.creator, locale)}</span>
              </p>
            ) : null}
            {site?.architecturalFeatures ? (
              <p className="mt-6 text-base leading-relaxed text-foam/80">{pick(site.architecturalFeatures, locale)}</p>
            ) : null}
            {!site?.architecturalStyle && !site?.architecturalFeatures && !site?.creator ? (
              <p className="mt-8 max-w-md text-base leading-relaxed text-foam/75">{story("architectureEmpty")}</p>
            ) : null}
          </div>
          <div className="lg:col-span-7">
            {hero && lookNotes.length > 0 ? (
              <StoryLook
                image={hero}
                alt={pick(hero.caption, locale)}
                notes={lookNotes}
                openLabel={story("lookCloser")}
                hideLabel={story("lookCloserHide")}
                lead={story("lookCloserLead")}
              />
            ) : images[0] ? (
              <figure className="border border-foam/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0].url} alt={pick(images[0].caption, locale)} className="aspect-[16/10] w-full object-cover" />
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      {/* SCENE 4 (TIMELINE TO MAP) & SCENE 5 (CONNECTED STORIES) */}
      <section id="context" className="cs-story-section mx-auto max-w-[96rem] px-4 py-16 sm:px-5 sm:py-20 lg:px-8">
        <Reveal>
          <p className="cs-kicker">05 — {story("context")}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-7xl">{story("context")}</h2>
        </Reveal>
        <div className="mt-8 sm:mt-10">
          <TimelineToMapScene
            originSlug={place.slug}
            originName={pick(place.name, locale)}
            originCoordinates={place.coordinates}
            originMunicipality={place.municipality}
            connections={connectionItems}
            mapLabel={story("context")}
            openStoryLabel={t("openStory")}
            noPhotographLabel={story("noPhotograph")}
            nearbyLabel={t("nearby")}
          />
        </div>
        {continuePlace ? (
          <p className="mt-10">
            <Link href={sitePath(continuePlace)} className="cs-btn cs-btn-cobalt h-12">
              {story("continue")} — {pick(continuePlace.name, locale)}
            </Link>
          </p>
        ) : null}
        {programmes.length > 0 ? (
          <div className="mt-12">
            <h3 className="font-display text-3xl">{detail("events")}</h3>
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {programmes.map((event) => (
                <li key={event.slug}>
                  <Link href={`/events/${event.slug}`} className="inline-flex h-12 items-center font-display text-2xl hover:text-cobalt">
                    {pick(event.name, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* SCENE 6 — CONTINUE THE JOURNEY (ON THE GROUND & CALCULATED ITINERARY) */}
      <section id="location" className="cs-story-section border-y border-ink bg-foam py-16 sm:py-20">
        <div className="mx-auto grid max-w-[96rem] gap-10 px-4 sm:px-5 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="cs-kicker">06 — {story("location")}</p>
              <h2 className="mt-3 font-display text-4xl sm:text-6xl">{story("location")}</h2>
            </Reveal>
            <p className="mt-6 text-sm leading-relaxed">{pick(place.visit, locale)}</p>
            {ops ? (
              <div className="mt-4 space-y-2 border-l-2 border-cobalt pl-4 text-sm">
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
              <span className="block text-[10px] tracking-[0.22em] text-brass uppercase">{t("address")}</span>
              {pick(place.address, locale)}
            </p>
            <p className="mt-4 text-sm text-ink-soft">
              {place.walkMinutes === 0 ? t("atSquare") : t("walk", { minutes: place.walkMinutes })}
            </p>
            <p className="mt-4 text-xs tracking-[0.16em] text-ink-soft uppercase">
              {story("coordinates")}: {place.coordinates.lat.toFixed(5)}, {place.coordinates.lng.toFixed(5)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/around" className="cs-btn cs-btn-ink">
                {story("openAtlas")}
              </Link>
              <a className="cs-btn cs-btn-ghost" href={osm} target="_blank" rel="noreferrer">
                {t("osm")}
              </a>
            </div>

            <ContinueJourneyItinerary
              stops={journeyStops}
              streetTemplate={explore.raw("streetMeters") as string}
              approxTemplate={explore.raw("approxMeters") as string}
              loadingText={explore("routeLoading")}
              osmLabel={explore("navOsm")}
              googleLabel={explore("navGoogle")}
            />

            {walks.length > 0 ? (
              <div className="mt-10">
                <h3 className="font-display text-3xl">{story("addRoute")}</h3>
                <ul className="mt-4 divide-y divide-ink border-y border-ink">
                  {walks.map((walk) => (
                    <li key={walk.slug} className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <Link href={`/routes/${walk.slug}`} className="font-display text-2xl">
                        {pick(walk.name, locale)}
                      </Link>
                      <Link href="/around" className="text-xs tracking-[0.16em] text-copper uppercase">
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

      <section id="sources" className="cs-story-section mx-auto max-w-[96rem] px-4 py-16 sm:px-5 sm:py-20 lg:px-8">
        <Reveal>
          <p className="cs-kicker">07 — {story("sources")}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-6xl">{story("sources")}</h2>
          <p className="mt-4 max-w-2xl text-sm text-ink-soft">{evidence("sourcesNote")}</p>
        </Reveal>
        {place.municipality === "nearby" && place.nearbyNote ? (
          <p className="mt-8 border border-ink bg-paper-2 px-4 py-3 text-sm">{pick(place.nearbyNote, locale)}</p>
        ) : null}
        {place.boundaryNote ? <p className="mt-4 text-sm text-ink-soft">{pick(place.boundaryNote, locale)}</p> : null}
        <ul className="mt-8 divide-y divide-ink border-y border-ink">
          {registry.map((source) => (
            <li key={source.id} className="py-4 text-sm">
              <p className="font-medium">{source.title}</p>
              <p className="text-ink-soft">
                {source.publisher} · {evidence("accessed")} {source.accessed}
              </p>
              {source.url ? (
                <a href={source.url} className="text-copper underline" target="_blank" rel="noreferrer">
                  {source.url}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        {site ? (
          <p className="mt-4 text-xs tracking-[0.16em] text-ink-soft uppercase">
            {evidence("verified")} {site.lastChecked} · {evidence(site.verificationStatus)}
          </p>
        ) : null}
      </section>
    </article>
  );
}
