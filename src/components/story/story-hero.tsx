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
    <div ref={ref} className="cs-story-hero relative min-h-[86vh] overflow-hidden bg-ink">
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,22,18,0.18),rgba(28,22,18,0.78))]" />
        </motion.div>
      ) : (
        <div className="absolute inset-0">
          <Plate motif={motif} palette={palette} index={index} title={title} eyebrow={eyebrow} />
        </div>
      )}
      {image && credit ? (
        <p className="absolute right-5 bottom-5 z-[1] max-w-sm text-right text-[11px] tracking-[0.12em] text-foam/80 uppercase">
          {credit}
        </p>
      ) : null}
      {!image ? (
        <p className="absolute right-5 bottom-5 z-[1] max-w-xs text-right text-[11px] text-ink/70">{noPhotograph}</p>
      ) : null}
    </div>
  );
}
