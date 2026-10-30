"use client";

import dynamic from "next/dynamic";
import { ArrowDownRight, Navigation } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plate } from "@/components/atlas/plate";
import type { AtlasMarker } from "@/components/map/explore-map";
import type { ClaimKind, MediaAsset, Milestone } from "@/content/knowledge/schema";
import type { Coordinates, Motif } from "@/content/types";
import { Link, useRouter } from "@/i18n/navigation";
import { useWalkingPath } from "@/lib/mapping/use-walking-path";
import { pedestrianNavigation } from "@/lib/mapping/walk";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import { SCAN_CAPTURE_STORAGE_KEY } from "@/lib/scan/capture";
import { useScanCapture } from "@/lib/scan/use-scan-capture";

const Atlas = dynamic(
  () => import("@/components/map/explore-map").then((mod) => mod.ExploreMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-paper-2" /> },
);

export { SCAN_CAPTURE_STORAGE_KEY };

const kindClass: Record<ClaimKind, string> = {
  "documented-fact": "cs-claim-fact",
  "legend-folklore": "cs-claim-legend",
  interpretation: "cs-claim-interp",
  unverified: "cs-claim-unverified",
};

export function VisitorCaptureChip({
  slug,
  fromScan,
  label,
}: {
  slug: string;
  fromScan: boolean;
  label: string;
}) {
  const dataUrl = useScanCapture(slug, fromScan);

  if (!dataUrl) return null;

  return (
    <figure className="mt-4 inline-flex items-center gap-3 border border-foam/35 bg-ink/85 p-2 text-foam">
      {/* Visitor's own scan capture from this browser session; never presented as an archival photograph. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={dataUrl} alt="" className="h-12 w-16 border border-foam/25 object-cover" />
      <figcaption className="pr-2 text-[10px] tracking-[0.18em] text-foam/80 uppercase">
        {label}
      </figcaption>
    </figure>
  );
}

export function AnimatedTimelineScene({
  items,
  empty,
  uncertain,
  labels,
  heroImage,
  heroAlt,
}: {
  items: Array<Milestone & { labelText: string }>;
  empty: string;
  uncertain: string;
  labels: Record<ClaimKind, string>;
  heroImage?: MediaAsset;
  heroAlt: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, 0.96]);

  if (items.length === 0) {
    return <p className="max-w-xl text-base leading-relaxed text-ink-soft">{empty}</p>;
  }

  return (
    <div ref={ref} className="grid gap-10 lg:grid-cols-12">
      {heroImage ? (
        <div className="lg:col-span-4">
          <div className="sticky top-28 overflow-hidden border border-ink bg-ink text-foam">
            <motion.div style={reduce ? undefined : { scale: imgScale }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaSrc(heroImage, 960)}
                srcSet={mediaSrcSet(heroImage)}
                sizes="(min-width: 1024px) 30vw, 100vw"
                alt={heroAlt}
                className="aspect-[4/3] w-full object-cover"
              />
            </motion.div>
            <p className="border-t border-foam/20 px-4 py-3 text-[11px] tracking-[0.16em] text-foam/80 uppercase">
              {heroImage.credit} · {heroImage.license}
            </p>
          </div>
        </div>
      ) : null}

      <div className={`relative pl-6 sm:pl-9 ${heroImage ? "lg:col-span-8" : "lg:col-span-12"}`}>
        <span className="absolute top-2 bottom-2 left-1.5 w-px bg-line sm:left-2" aria-hidden="true" />
        {!reduce ? (
          <motion.span
            className="absolute top-2 bottom-2 left-1.5 w-0.5 origin-top bg-cobalt sm:left-2"
            style={{ scaleY }}
            aria-hidden="true"
          />
        ) : null}
        <ol className="divide-y divide-ink border-y border-ink">
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              className={`relative grid gap-3 py-8 pl-4 lg:grid-cols-12 lg:items-baseline ${kindClass[item.kind]}`}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.45, delay: reduce ? 0 : Math.min(index * 0.04, 0.16), ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className="absolute top-10 -left-[1.35rem] size-3 border-2 border-paper bg-cobalt sm:-left-[1.95rem]"
                aria-hidden="true"
              />
              <div className="lg:col-span-4">
                <p className="font-display text-5xl leading-none text-ink sm:text-6xl">{item.date}</p>
                {(item.precision === "range" || item.precision === "century") && (
                  <p className="mt-2 text-[10px] tracking-[0.2em] text-copper uppercase">{uncertain}</p>
                )}
              </div>
              <div className="lg:col-span-8">
                <p className="text-[10px] tracking-[0.22em] text-brass uppercase">{labels[item.kind]}</p>
                <p className="mt-2.5 max-w-2xl text-base leading-relaxed sm:text-lg">{item.labelText}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export type ConnectedConnectionItem = {
  slug: string;
  name: string;
  eyebrow: string;
  href: string;
  coordinates: Coordinates;
  municipality: "centar" | "nearby";
  historical: boolean;
  relationBadge: string;
  explanation: string;
  motif: Motif;
  palette: [string, string];
  image?: MediaAsset;
  imageAlt: string;
};

export function TimelineToMapScene({
  originSlug,
  originName,
  originCoordinates,
  originMunicipality,
  connections,
  mapLabel,
  openStoryLabel,
  noPhotographLabel,
  nearbyLabel,
}: {
  originSlug: string;
  originName: string;
  originCoordinates: Coordinates;
  originMunicipality: "centar" | "nearby";
  connections: ConnectedConnectionItem[];
  mapLabel: string;
  openStoryLabel: string;
  noPhotographLabel: string;
  nearbyLabel: string;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [activeSlug, setActiveSlug] = useState<string>(connections[0]?.slug ?? originSlug);
  const [revealedCount, setRevealedCount] = useState<number>(connections.length);

  useEffect(() => {
    if (reduce || connections.length === 0) {
      setRevealedCount(connections.length);
      return;
    }
    setRevealedCount(1);
    const timer = window.setInterval(() => {
      setRevealedCount((c) => {
        if (c >= connections.length) {
          window.clearInterval(timer);
          return c;
        }
        return c + 1;
      });
    }, 260);
    return () => window.clearInterval(timer);
  }, [connections.length, reduce]);

  const visibleConnections = connections.slice(0, revealedCount);
  const activeConnection = connections.find((item) => item.slug === activeSlug) ?? connections[0];

  const markers: AtlasMarker[] = useMemo(
    () => [
      {
        id: originSlug,
        lat: originCoordinates.lat,
        lng: originCoordinates.lng,
        label: originName,
        tone: originMunicipality === "nearby" ? ("nearby" as const) : ("site" as const),
      },
      ...visibleConnections.map((item) => ({
        id: item.slug,
        lat: item.coordinates.lat,
        lng: item.coordinates.lng,
        label: item.name,
        tone: item.municipality === "nearby" ? ("nearby" as const) : ("site" as const),
      })),
    ],
    [originCoordinates.lat, originCoordinates.lng, originMunicipality, originName, originSlug, visibleConnections],
  );

  const line: [number, number][] | null = useMemo(() => {
    if (!activeConnection) return null;
    return [
      [originCoordinates.lat, originCoordinates.lng],
      [activeConnection.coordinates.lat, activeConnection.coordinates.lng],
    ];
  }, [activeConnection, originCoordinates.lat, originCoordinates.lng]);

  return (
    <div className="space-y-10">
      {/* SCENE 4 — TIMELINE LINE MORPHS INTO GEOGRAPHIC RELATIONSHIP MAP */}
      <div className="grid border border-ink bg-paper lg:grid-cols-12">
        <div className="h-80 border-b border-ink sm:h-[26rem] lg:col-span-7 lg:h-auto lg:min-h-[28rem] lg:border-r lg:border-b-0">
          <Atlas
            markers={markers}
            selectedId={activeConnection?.slug ?? originSlug}
            onSelect={(id) => {
              if (id === originSlug) return;
              const match = connections.find((c) => c.slug === id);
              if (match) setActiveSlug(match.slug);
            }}
            line={line}
            user={null}
            label={mapLabel}
          />
        </div>
        <div className="flex flex-col justify-between p-5 sm:p-7 lg:col-span-5">
          {activeConnection ? (
            <div>
              <p
                className={`text-[10px] tracking-[0.22em] uppercase ${
                  activeConnection.historical ? "text-cobalt" : "text-brass"
                }`}
              >
                {activeConnection.relationBadge}
              </p>
              <h3 className="mt-2 font-display text-3xl leading-none sm:text-4xl">
                {originName} → {activeConnection.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{activeConnection.explanation}</p>
            </div>
          ) : null}

          <div className="mt-6 space-y-2 border-t border-line pt-4">
            <div className="cs-no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {connections.map((item, idx) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setActiveSlug(item.slug)}
                  className={`cs-chip h-9 px-3 text-[11px] ${item.slug === activeConnection?.slug ? "is-on" : ""}`}
                >
                  {String(idx + 1).padStart(2, "0")} · {item.name}
                </button>
              ))}
            </div>
            {activeConnection ? (
              <button
                type="button"
                onClick={() => router.push(activeConnection.href)}
                className="cs-btn cs-btn-cobalt mt-2 w-full justify-between"
              >
                <span>{openStoryLabel} — {activeConnection.name}</span>
                <ArrowDownRight className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* SCENE 5 — CONNECTED STORIES */}
      {connections.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2">
          {connections.map((item, idx) => {
            const folio = String(idx + 1).padStart(2, "0");
            return (
              <motion.li
                key={item.slug}
                initial={reduce ? false : { opacity: 0, y: 36, rotate: idx % 2 === 0 ? -4 : 4, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                transition={{ duration: 0.62, delay: reduce ? 0 : Math.min(idx * 0.07, 0.28) }}
                className="border border-ink bg-foam"
                style={{ borderTop: `5px solid ${item.palette[0]}` }}
              >
                <Link href={item.href} className="group flex h-full flex-col justify-between">
                  <div>
                    <div className="relative h-44 overflow-hidden border-b border-ink bg-ink">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaSrc(item.image, 640)}
                          alt={item.imageAlt}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <Plate
                          motif={item.motif}
                          palette={item.palette}
                          index={folio}
                          title={item.name}
                          eyebrow={noPhotographLabel}
                        />
                      )}
                      <span
                        className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] tracking-[0.2em] text-foam uppercase ${
                          item.historical ? "bg-cobalt" : "bg-ink/85"
                        }`}
                      >
                        {item.relationBadge}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] tracking-[0.2em] text-brass uppercase">
                        {folio} · {item.municipality === "nearby" ? `${nearbyLabel} · ` : ""}
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-1.5 font-display text-3xl leading-none group-hover:text-cobalt">
                        {item.name}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed text-ink-soft">{item.explanation}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] tracking-[0.18em] text-cobalt uppercase">
                    <span>{openStoryLabel}</span>
                    <ArrowDownRight className="size-4" aria-hidden="true" />
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function ContinueJourneyItinerary({
  stops,
  streetTemplate,
  approxTemplate,
  loadingText,
  osmLabel,
  googleLabel,
}: {
  stops: Array<{ slug: string; name: string; href: string; coordinates: Coordinates }>;
  streetTemplate: string;
  approxTemplate: string;
  loadingText: string;
  osmLabel: string;
  googleLabel: string;
}) {
  const points = useMemo(() => stops.map((stop) => stop.coordinates), [stops]);
  const { status, path } = useWalkingPath(points.length > 1 ? points : null);
  const nav = points.length > 1 ? pedestrianNavigation(points) : { osm: null, google: null };

  if (stops.length < 2) return null;

  const summary =
    status === "loading"
      ? loadingText
      : path?.source === "street" && path.minutes && path.meters
        ? streetTemplate.replace("{minutes}", String(path.minutes)).replace("{meters}", String(path.meters))
        : path?.meters
          ? approxTemplate.replace("{meters}", String(path.meters))
          : null;

  return (
    <div className="mt-8 border border-ink bg-paper p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-3">
        <p className="text-[11px] tracking-[0.2em] text-cobalt uppercase">
          01 → 0{stops.length}
        </p>
        <p className="text-xs text-ink-soft" aria-live="polite">
          {summary}
        </p>
      </div>
      <ol className="divide-y divide-line">
        {stops.map((stop, idx) => (
          <li key={stop.slug} className="flex items-baseline justify-between gap-3 py-3">
            <Link href={stop.href} className="font-display text-2xl hover:text-cobalt">
              <span className="mr-2.5 text-base text-copper">{String(idx + 1).padStart(2, "0")}</span>
              {stop.name}
            </Link>
            <span className="text-[10px] tracking-[0.16em] text-ink-soft uppercase">
              {stop.coordinates.lat.toFixed(4)}°N
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {nav.osm ? (
          <a href={nav.osm} className="cs-btn cs-btn-cobalt flex-1 sm:flex-none" target="_blank" rel="noreferrer">
            <Navigation className="size-4" aria-hidden="true" />
            {osmLabel}
          </a>
        ) : null}
        {nav.google ? (
          <a href={nav.google} className="cs-btn cs-btn-ghost flex-1 sm:flex-none" target="_blank" rel="noreferrer">
            {googleLabel}
          </a>
        ) : null}
      </div>
    </div>
  );
}
