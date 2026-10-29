"use client";

import { motion, useReducedMotion } from "motion/react";
import { pick } from "@/content/copy";
import type { ClaimKind, Milestone } from "@/content/knowledge/schema";

const kindClass: Record<ClaimKind, string> = {
  "documented-fact": "cs-claim-fact",
  "legend-folklore": "cs-claim-legend",
  interpretation: "cs-claim-interp",
  unverified: "cs-claim-unverified",
};

export function StoryTimeline({
  items,
  locale,
  empty,
  uncertain,
  labels,
}: {
  items: Milestone[];
  locale: string;
  empty: string;
  uncertain: string;
  labels: Record<ClaimKind, string>;
}) {
  const reduce = useReducedMotion();

  if (items.length === 0) {
    return <p className="max-w-xl text-base leading-relaxed text-ink-soft">{empty}</p>;
  }

  return (
    <ol className="relative border-l border-line pl-6 sm:pl-8">
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          className={`relative mb-10 last:mb-0 ${kindClass[item.kind]}`}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.5, delay: reduce ? 0 : Math.min(index * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="absolute top-1.5 -left-[1.55rem] h-2.5 w-2.5 rounded-full bg-copper sm:-left-[2.05rem]" />
          <p className="font-display text-3xl leading-none text-brass">{item.date}</p>
          {(item.precision === "range" || item.precision === "century") && (
            <p className="mt-2 text-[11px] tracking-[0.16em] text-ink-soft uppercase">{uncertain}</p>
          )}
          <p className="mt-2 text-[11px] tracking-[0.16em] text-brass uppercase">{labels[item.kind]}</p>
          <p className="mt-3 max-w-2xl text-base leading-relaxed">{pick(item.label, locale)}</p>
        </motion.li>
      ))}
    </ol>
  );
}
