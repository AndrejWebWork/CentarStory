"use client";

import { ArrowDownRight, Camera } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { pick } from "@/content/copy";
import { getMedia } from "@/content/knowledge/media";
import { CENTAR_BBOX, CENTAR_OSM_RELATION, CENTAR_POLYGON } from "@/content/knowledge/polygon";
import { VERIFIED_ON } from "@/content/knowledge/sources";
import { getPlace } from "@/content/places";
import { Link } from "@/i18n/navigation";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";

const BOUNDARY_PATH = (() => {
  const w = CENTAR_BBOX.east - CENTAR_BBOX.west;
  const h = CENTAR_BBOX.north - CENTAR_BBOX.south;
  return `${CENTAR_POLYGON.map(([lng, lat], index) => {
    const x = (((lng - CENTAR_BBOX.west) / w) * 280 + 20).toFixed(1);
    const y = (((CENTAR_BBOX.north - lat) / h) * 200 + 20).toFixed(1);
    return `${index === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ")} Z`;
})();

export function MovementMasthead() {
  const t = useTranslations("around");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const bridgePhoto = getMedia("img-stone-bridge-delso");
  const kalePhoto = getMedia("img-kale-kallerna");
  const teresaPhoto = getMedia("img-mother-teresa-danielmkd");

  return (
    <section className="relative mx-3 mt-3 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#0f172a_0%,#1e3a8a_58%,#3b6dff_140%)] text-foam sm:mx-4">
      <div className="mx-auto grid max-w-[96rem] grid-cols-1 lg:min-h-[calc(100dvh-6.5rem)] lg:grid-cols-12">
        <div className="relative flex flex-col justify-between border-b border-foam/20 p-4 sm:p-8 lg:col-span-7 lg:border-r lg:border-b-0 lg:p-12">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foam/20 pb-3 text-[10px] tracking-[0.24em] text-foam/70 uppercase">
            <span>01 — {t("kicker")}</span>
            <span>OSM {CENTAR_OSM_RELATION} · {VERIFIED_ON}</span>
          </div>

          <div className="relative my-5 sm:my-8 lg:my-0">
            <svg
              viewBox="0 0 320 240"
              className="pointer-events-none absolute -top-6 right-0 h-40 w-56 text-foam/15 sm:h-72 sm:w-96"
              aria-hidden="true"
            >
              <motion.path
                d={BOUNDARY_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <circle cx="176" cy="112" r="4" className="fill-cobalt" />
            </svg>
            <p className="text-[10px] tracking-[0.26em] text-brass uppercase sm:text-[11px]">
              41.9957°N · 21.4312°E · Vardar Axis
            </p>
            <h1 className="mt-2 font-display text-[clamp(3.1rem,10.5vw,9.2rem)] leading-[0.84] tracking-tight sm:mt-4">
              Centar
              <span className="block pl-[8%] text-brass italic">{t("title")}.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-foam/80 sm:mt-8 sm:text-lg">{t("lede")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-foam/20 pt-4 sm:gap-4 sm:pt-6">
            <a
              href="#move"
              className="flex items-center justify-between rounded-full border border-foam bg-foam px-4 py-3 text-[11px] tracking-[0.18em] text-ink uppercase hover:bg-paper-2 sm:px-5 sm:py-4 sm:text-xs"
            >
              <span>{t("makeRoute")}</span>
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </a>
            <Link
              href="/scan"
              className="flex items-center justify-between rounded-full border border-cobalt bg-cobalt px-4 py-3 text-[11px] tracking-[0.18em] text-foam uppercase sm:px-5 sm:py-4 sm:text-xs"
            >
              <span>{nav("scan")}</span>
              <Camera className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative hidden flex-col justify-between bg-ink lg:col-span-5 lg:flex">
          {bridgePhoto ? (
            <figure className="relative min-h-[26rem] flex-1 overflow-hidden border-b border-foam/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaSrc(bridgePhoto, 1280)}
                srcSet={mediaSrcSet(bridgePhoto)}
                sizes="(min-width: 1024px) 42vw, 100vw"
                alt={pick(bridgePhoto.caption, locale)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-[11px] text-foam/85">
                <div>
                  <span className="block tracking-[0.2em] text-brass uppercase">01 / Stone Bridge</span>
                  <span className="mt-1 block max-w-xs text-xs text-foam/80">{pick(bridgePhoto.caption, locale)}</span>
                </div>
                <span className="shrink-0 text-[10px] tracking-[0.16em] uppercase">{bridgePhoto.credit}</span>
              </figcaption>
            </figure>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2">
            {kalePhoto ? (
              <Link
                href="/places/skopje-fortress"
                className="group relative block aspect-[4/3] overflow-hidden border-b border-foam/20 sm:border-r sm:border-b-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaSrc(kalePhoto, 960)}
                  alt={pick(kalePhoto.caption, locale)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/45" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] tracking-[0.2em] text-brass uppercase">06 / Kale</p>
                  <p className="mt-1 font-display text-2xl leading-none text-foam">
                    {pick(getPlace("skopje-fortress")!.name, locale)}
                  </p>
                </div>
              </Link>
            ) : null}
            {teresaPhoto ? (
              <Link href="/museums/mother-teresa-house" className="group relative block aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaSrc(teresaPhoto, 960)}
                  alt={pick(teresaPhoto.caption, locale)}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/45" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] tracking-[0.2em] text-brass uppercase">04 / 2009</p>
                  <p className="mt-1 font-display text-2xl leading-none text-foam">
                    {pick(getPlace("mother-teresa-house")!.name, locale)}
                  </p>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
