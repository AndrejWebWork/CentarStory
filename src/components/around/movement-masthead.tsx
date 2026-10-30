"use client";

import { ArrowDownRight, Camera } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useRef } from "react";
import { pick } from "@/content/copy";
import { getMedia } from "@/content/knowledge/media";
import { CENTAR_BBOX, CENTAR_OSM_RELATION, CENTAR_POLYGON } from "@/content/knowledge/polygon";
import { VERIFIED_ON } from "@/content/knowledge/sources";
import { getPlace } from "@/content/places";
import { Link } from "@/i18n/navigation";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion/gsap-client";

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
  const rootRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const bridgePhoto = getMedia("img-stone-bridge-delso");
  const kalePhoto = getMedia("img-kale-kallerna");
  const teresaPhoto = getMedia("img-mother-teresa-danielmkd");

  useLayoutEffect(() => {
    registerGsap();
    const root = rootRef.current;
    const path = pathRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const title = root.querySelectorAll("[data-mast-title]");
      const fade = root.querySelectorAll("[data-mast-fade]");
      gsap.set(title, { yPercent: 110 });
      gsap.set(fade, { autoAlpha: 0, y: 12 });

      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, { strokeDashoffset: 0, duration: 2.4, ease: "power2.out", delay: 0.15 });
      }

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(title, { yPercent: 0, duration: 0.9, stagger: 0.08 }, 0.08)
        .to(fade, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06 }, 0.28);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative mx-3 mt-3 overflow-hidden bg-ink text-foam sm:mx-4">
      <div className="mx-auto grid max-w-[96rem] grid-cols-1 lg:min-h-[calc(100dvh-6.5rem)] lg:grid-cols-12">
        <div className="relative flex flex-col justify-between border-b border-foam/15 p-5 sm:p-8 lg:col-span-7 lg:border-r lg:border-b-0 lg:p-12">
          <div
            data-mast-fade
            className="flex flex-wrap items-center justify-between gap-3 border-b border-foam/15 pb-3 text-[10px] tracking-[0.26em] text-foam/55 uppercase"
          >
            <span>01 — {t("kicker")}</span>
            <span>OSM {CENTAR_OSM_RELATION} · {VERIFIED_ON}</span>
          </div>

          <div className="relative my-6 sm:my-10 lg:my-0">
            <svg
              viewBox="0 0 320 240"
              className="pointer-events-none absolute -top-6 right-0 h-40 w-56 text-foam/18 sm:h-72 sm:w-96"
              aria-hidden="true"
            >
              <path
                ref={pathRef}
                d={BOUNDARY_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle cx="176" cy="112" r="3.5" className="fill-cobalt" />
            </svg>
            <p data-mast-fade className="text-[10px] tracking-[0.26em] text-brass uppercase sm:text-[11px]">
              41.9957°N · 21.4312°E · Vardar Axis
            </p>
            <h1 className="mt-3 font-display text-[clamp(3.1rem,10.5vw,8.6rem)] leading-[0.84] tracking-tight sm:mt-4">
              <span className="block overflow-hidden">
                <span data-mast-title className="block">
                  Centar
                </span>
              </span>
              <span className="block overflow-hidden pl-[8%] text-brass italic">
                <span data-mast-title className="block">
                  {t("title")}.
                </span>
              </span>
            </h1>
            <p data-mast-fade className="mt-5 max-w-xl text-sm leading-relaxed text-foam/72 sm:mt-8 sm:text-lg">
              {t("lede")}
            </p>
          </div>

          <div data-mast-fade className="grid grid-cols-2 gap-px bg-foam/15">
            <a
              href="#move"
              className="flex items-center justify-between bg-foam px-4 py-4 text-[11px] tracking-[0.16em] text-ink uppercase hover:bg-paper-2 sm:px-5 sm:text-xs"
            >
              <span>{t("makeRoute")}</span>
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </a>
            <Link
              href="/scan"
              className="flex items-center justify-between bg-cobalt px-4 py-4 text-[11px] tracking-[0.16em] text-foam uppercase sm:px-5 sm:text-xs"
            >
              <span>{nav("scan")}</span>
              <Camera className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="relative hidden flex-col justify-between bg-ink lg:col-span-5 lg:flex">
          {bridgePhoto ? (
            <figure className="relative min-h-[26rem] flex-1 overflow-hidden border-b border-foam/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaSrc(bridgePhoto, 1280)}
                srcSet={mediaSrcSet(bridgePhoto)}
                sizes="(min-width: 1024px) 42vw, 100vw"
                alt={pick(bridgePhoto.caption, locale)}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
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
                className="group relative block aspect-[4/3] overflow-hidden border-b border-foam/15 sm:border-r sm:border-b-0"
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
