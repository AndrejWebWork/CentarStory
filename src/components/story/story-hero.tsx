"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Plate } from "@/components/atlas/plate";
import { SkeletonOverlay } from "@/components/scan/skeleton-overlay";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion/gsap-client";
import { skeletonFromCanvas, type SkeletonMesh } from "@/lib/recognition/skeleton";
import { useScanCapture } from "@/lib/scan/use-scan-capture";
import { monumentTone } from "@/lib/story/monument-tone";
import type { MediaAsset } from "@/content/knowledge/schema";
import type { Motif } from "@/content/types";

export function StoryHero({
  image,
  imageAlt,
  credit,
  index,
  motif,
  palette,
  title,
  eyebrow,
  noPhotograph,
  cinematic = false,
  slug,
  scanLabel,
  scrollLabel,
}: {
  image?: MediaAsset;
  imageAlt: string;
  credit?: string;
  index: string;
  motif: Motif;
  palette: [string, string];
  title: string;
  eyebrow: string;
  noPhotograph: string;
  cinematic?: boolean;
  slug: string;
  scanLabel: string;
  scrollLabel?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const visitorShot = useScanCapture(slug, cinematic);
  const [skeleton, setSkeleton] = useState<SkeletonMesh | null>(null);
  const tone = monumentTone(slug, motif);

  useEffect(() => {
    if (!cinematic || !visitorShot) {
      setSkeleton(null);
      return;
    }
    let cancelled = false;
    const imageEl = new Image();
    imageEl.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, imageEl.naturalWidth);
      canvas.height = Math.max(1, imageEl.naturalHeight);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(imageEl, 0, 0);
      setSkeleton(skeletonFromCanvas(canvas));
    };
    imageEl.src = visitorShot;
    return () => {
      cancelled = true;
    };
  }, [cinematic, visitorShot]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    registerGsap();

    const reduce = prefersReducedMotion();
    const archive = root.querySelector<HTMLElement>("[data-hero-archive]");
    const visitor = root.querySelector<HTMLElement>("[data-hero-visitor]");
    const chip = root.querySelector<HTMLElement>("[data-hero-chip]");
    const titleEl = root.querySelector<HTMLElement>("[data-hero-title]");
    const meta = root.querySelectorAll("[data-hero-meta]");

    if (reduce) {
      gsap.set([titleEl, meta, chip], { clearProps: "all", autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const wash = root.querySelector("[data-hero-wash]");
      gsap.set(titleEl, { yPercent: 128, rotate: -4, scale: 1.12 });
      gsap.set(meta, { autoAlpha: 0, y: 14 });
      if (chip) gsap.set(chip, { autoAlpha: 0, y: 28, rotate: 8, scale: 0.88 });
      if (archive) gsap.set(archive, { scale: cinematic ? 1.28 : 1.1, rotate: cinematic ? 1.4 : 0 });
      if (wash) gsap.set(wash, { autoAlpha: 0.2, scale: 1.16 });
      if (visitor && cinematic) {
        gsap.set(visitor, { scale: 1.12, clipPath: "inset(0% 0% 0% 0%)" });
      }

      const tl = gsap.timeline({
        delay: cinematic ? 1.95 : 0.04,
        defaults: { ease: "power3.out" },
      });

      if (visitor && cinematic) {
        tl.to(
          visitor,
          { clipPath: "inset(0% 0% 0% 100%)", scale: 1, duration: 1.2, ease: "power3.inOut" },
          0,
        );
      }

      if (archive) {
        tl.to(archive, { scale: 1, rotate: 0, duration: cinematic ? 1.55 : 1.15, ease: "power2.out" }, 0);
      }
      if (wash) {
        tl.to(wash, { autoAlpha: 1, scale: 1, duration: 1.1 }, 0);
      }

      tl.to(titleEl, { yPercent: 0, rotate: 0, scale: 1, duration: 0.96 }, cinematic && visitor ? 0.4 : 0.1)
        .to(meta, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, "-=0.4");

      if (chip) {
        tl.to(chip, { autoAlpha: 1, y: 0, rotate: 0, scale: 1, duration: 0.55 }, "-=0.25");
      }

      if (archive) {
        gsap.to(archive, {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [cinematic, visitorShot]);

  return (
    <div ref={rootRef} className="cs-story-hero relative min-h-[86vh] overflow-hidden bg-ink">
      <div
        className="absolute inset-0"
        ref={(node) => {
          if (!node) return;
          node.style.setProperty("--cs-wash-a", tone.washA);
          node.style.setProperty("--cs-ink", tone.ink);
          node.style.setProperty("--cs-ink-a", `${tone.ink}2e`);
          node.style.setProperty("--cs-ink-b", `${tone.ink}66`);
          node.style.setProperty("--cs-ink-c", `${tone.ink}f2`);
          node.style.setProperty("--cs-accent", tone.accent);
        }}
      >
      {image ? (
        <div className="absolute inset-0 overflow-hidden">
          <div data-hero-archive className="absolute inset-0 will-change-transform">
            {/* Authentic Commons photograph; next/image is not configured for this host. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaSrc(image, 1280)}
              srcSet={mediaSrcSet(image)}
              sizes="100vw"
              alt={imageAlt}
              className="h-[118%] w-full object-cover"
            />
          </div>
          <div data-hero-wash className="cs-hero-wash absolute inset-0" />
        </div>
      ) : (
        <div className="absolute inset-0">
          <Plate motif={motif} palette={palette} index={index} title={title} eyebrow={eyebrow} />
        </div>
      )}

      {visitorShot ? (
        <div
          data-hero-visitor
          className="absolute inset-0 z-[1] overflow-hidden bg-ink"
          aria-hidden="true"
        >
          {/* Visitor's own scan capture from this browser session; never presented as an archival photograph. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={visitorShot} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ink/20" />
          <SkeletonOverlay mesh={skeleton} active={Boolean(skeleton)} locked failed={false} delay={0.15} />
        </div>
      ) : null}

      <div className="relative z-[2] mx-auto flex min-h-[86vh] max-w-[96rem] flex-col justify-between px-5 py-6 text-foam sm:px-8 sm:py-8 lg:px-12 lg:py-10">
        <div
          data-hero-meta
          className="flex items-center justify-between border-b border-foam/20 pb-3 text-[10px] tracking-[0.26em] text-foam/70 uppercase"
        >
          <span>{eyebrow}</span>
          <span>Folio {index}</span>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="overflow-hidden">
              <h1
                data-hero-title
                className="max-w-5xl font-display text-[clamp(2.8rem,10vw,7.4rem)] leading-[0.84] tracking-tight"
                style={{ textShadow: "0 0 48px color-mix(in srgb, var(--cs-accent) 33%, transparent)" }}
              >
                {title}
              </h1>
            </div>
            <p
              data-hero-meta
              className="mt-5 max-w-xl border-t border-foam/20 pt-3 text-[10px] tracking-[0.16em] text-foam/70 uppercase sm:text-[11px]"
            >
              {image && credit ? credit : noPhotograph}
            </p>
          </div>

          {visitorShot ? (
            <figure
              data-hero-chip
              className="flex w-[9.5rem] shrink-0 flex-col overflow-hidden bg-ink/80 sm:w-44"
              style={{ border: "1px solid var(--cs-accent)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={visitorShot} alt="" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="px-2 py-1.5 text-[9px] tracking-[0.16em] text-foam/75 uppercase">
                {scanLabel}
              </figcaption>
            </figure>
          ) : null}
        </div>
        {scrollLabel ? (
          <a
            href="#chronicle"
            className="cs-scroll-cue absolute bottom-24 left-1/2 z-[3] -translate-x-1/2 text-[10px] tracking-[0.32em] text-foam/80 uppercase lg:bottom-8"
          >
            {scrollLabel}
          </a>
        ) : null}
      </div>
      </div>
    </div>
  );
}
