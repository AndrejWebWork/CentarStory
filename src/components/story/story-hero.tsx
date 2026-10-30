"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Plate } from "@/components/atlas/plate";
import { mediaSrc, mediaSrcSet } from "@/lib/media/src";
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
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 48]);

  return (
    <div ref={ref} className="cs-story-hero relative min-h-[78vh] overflow-hidden border-b border-ink bg-ink">
      {image ? (
        <motion.div className="absolute inset-0" style={{ y }}>
          {/* Authentic Commons photograph; next/image is not configured for this host. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaSrc(image, 1280)}
            srcSet={mediaSrcSet(image)}
            sizes="100vw"
            alt={imageAlt}
            className="h-[110%] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,13,0.22),rgba(18,16,13,0.88))]" />
        </motion.div>
      ) : (
        <div className="absolute inset-0">
          <Plate motif={motif} palette={palette} index={index} title={title} eyebrow={eyebrow} />
        </div>
      )}
      <div className="relative z-[1] mx-auto flex min-h-[68vh] max-w-[96rem] flex-col justify-between p-4 text-foam sm:min-h-[78vh] sm:p-8 lg:p-12">
        <div className="flex items-center justify-between text-[10px] tracking-[0.24em] text-foam/80 uppercase">
          <span>{eyebrow}</span>
          <span>Folio {index}</span>
        </div>
        <div>
          <h1 className="max-w-5xl font-display text-[clamp(2.85rem,11vw,7.5rem)] leading-[0.86] tracking-tight">
            {title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-foam/25 pt-3 text-[10px] tracking-[0.16em] text-foam/80 uppercase sm:text-[11px]">
            <span>{image && credit ? credit : noPhotograph}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
