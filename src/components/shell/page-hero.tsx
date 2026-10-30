"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { useGsapContext } from "@/components/motion/use-gsap-context";
import { gsap } from "@/lib/motion/gsap-client";

export function PageHero({
  index,
  kicker,
  title,
  lede,
  tone = "ink",
  extra,
}: {
  index: string;
  kicker: string;
  title: string;
  lede: string;
  tone?: "ink" | "paper" | "plain" | "copper";
  extra?: ReactNode;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useGsapContext(
    rootRef,
    () => {
      const root = rootRef.current;
      if (!root) return;
      const titleEl = root.querySelector("[data-page-title]");
      const rest = root.querySelectorAll("[data-page-fade]");
      if (!titleEl) return;
      gsap.set(titleEl, { yPercent: 112 });
      gsap.set(rest, { autoAlpha: 0, y: 10 });
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(titleEl, { yPercent: 0, duration: 0.82 }, 0.06)
        .to(rest, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.22);
    },
    [title],
  );

  const surface =
    tone === "ink"
      ? "bg-ink text-foam"
      : tone === "copper"
        ? "bg-copper text-foam"
        : tone === "paper"
          ? "bg-paper-2 text-ink"
          : "bg-foam text-ink";

  const muted = tone === "ink" || tone === "copper" ? "text-foam/68" : "text-ink-soft";
  const rule = tone === "ink" || tone === "copper" ? "border-foam/18" : "border-ink/10";

  return (
    <header ref={rootRef} className={`relative mx-3 mt-3 overflow-hidden sm:mx-4 ${surface}`}>
      <div className="relative mx-auto max-w-[96rem] px-5 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div
          data-page-fade
          className={`flex items-baseline justify-between gap-4 border-b pb-3 text-[10px] tracking-[0.26em] uppercase ${rule} ${muted}`}
        >
          <p className="cs-kicker m-0 text-inherit">
            {index} — {kicker}
          </p>
          <span aria-hidden="true">{index}</span>
        </div>
        <div className="grid gap-8 pt-6 lg:grid-cols-12 lg:items-end lg:pt-8">
          <div className="overflow-hidden lg:col-span-8">
            <h1
              data-page-title
              className="font-display text-[clamp(2.6rem,8vw,5.4rem)] leading-[0.9] tracking-tight"
            >
              {title}
            </h1>
          </div>
          <div data-page-fade className={`lg:col-span-4 lg:border-l lg:pl-8 ${rule}`}>
            <p className={`text-sm leading-relaxed sm:text-base ${muted}`}>{lede}</p>
            {extra}
          </div>
        </div>
      </div>
    </header>
  );
}
