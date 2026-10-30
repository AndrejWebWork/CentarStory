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
    <ol className="divide-y divide-ink border-y border-ink">
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          className={`grid gap-4 py-8 pl-4 lg:grid-cols-12 lg:items-baseline ${kindClass[item.kind]}`}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.45, delay: reduce ? 0 : Math.min(index * 0.04, 0.2), ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lg:col-span-4">
            <p className="font-display text-5xl leading-none text-ink sm:text-6xl">{item.date}</p>
            {(item.precision === "range" || item.precision === "century") && (
              <p className="mt-2 text-[10px] tracking-[0.2em] text-copper uppercase">{uncertain}</p>
            )}
          </div>
          <div className="lg:col-span-8">
            <p className="text-[10px] tracking-[0.22em] text-brass uppercase">{labels[item.kind]}</p>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed">{pick(item.label, locale)}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
