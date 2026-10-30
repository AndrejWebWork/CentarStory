"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gsap, prefersReducedMotion, registerGsap } from "@/lib/motion/gsap-client";
import { useMounted } from "@/lib/use-mounted";

export function CinematicEntry({
  active,
  index,
  eyebrow,
  title,
  era,
  coordinates,
  accent,
  washA,
  washB,
}: {
  active: boolean;
  index: string;
  eyebrow: string;
  title: string;
  era: string;
  coordinates: string;
  accent?: string;
  washA?: string;
  washB?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [open, setOpen] = useState(active);

  useLayoutEffect(() => {
    if (!active || prefersReducedMotion()) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [active]);

  useLayoutEffect(() => {
    if (!mounted || !open || !active) return;
    if (prefersReducedMotion()) return;

    registerGsap();
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const meta = root.querySelectorAll("[data-entry-meta]");
      const titleEl = root.querySelector("[data-entry-title]");
      const rule = root.querySelector("[data-entry-rule]");

      const wash = root.querySelector("[data-entry-wash]");
      gsap.set(meta, { autoAlpha: 0, y: 16 });
      gsap.set(titleEl, { yPercent: 118, rotate: -3, scale: 1.08 });
      gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
      if (wash) gsap.set(wash, { autoAlpha: 0, scale: 1.2 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.to(root, {
            yPercent: -108,
            duration: 0.72,
            ease: "power3.inOut",
            onComplete: () => setOpen(false),
          });
        },
      });

      if (wash) tl.to(wash, { autoAlpha: 1, scale: 1, duration: 0.7 }, 0);
      tl.to(meta, { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.06 }, 0.08)
        .to(titleEl, { yPercent: 0, rotate: 0, scale: 1, duration: 0.94 }, 0.16)
        .to(rule, { scaleX: 1, duration: 1.35, ease: "power2.inOut" }, 0.22);
    }, root);

    return () => ctx.revert();
  }, [active, mounted, open]);

  if (!active || !open || !mounted) return null;

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] bg-ink text-foam"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 flex flex-col justify-between px-5 py-6 sm:px-10 sm:py-10"
        ref={(node) => {
          if (!node) return;
          node.style.setProperty("--cs-wash-a", washA ?? "transparent");
          node.style.setProperty("--cs-wash-b", washB ?? "transparent");
          node.style.setProperty("--cs-accent", accent ?? "var(--cobalt)");
        }}
      >
      <div data-entry-wash className="cs-entry-wash pointer-events-none absolute inset-0" />
      <div
        data-entry-meta
        className="relative z-10 flex items-center justify-between border-b border-foam/20 pb-3 text-[10px] tracking-[0.28em] text-brass uppercase"
      >
        <span>Folio {index} · {eyebrow}</span>
        <span>{coordinates}</span>
      </div>
      <div className="relative z-10">
        <p data-entry-meta className="cs-chronicle-ink text-[11px] tracking-[0.28em] uppercase">
          {era}
        </p>
        <div className="mt-4 overflow-hidden">
          <h2
            data-entry-title
            className="max-w-5xl font-display text-[clamp(3rem,10vw,8.5rem)] leading-[0.82] tracking-tight"
          >
            {title}
          </h2>
        </div>
      </div>
      <div data-entry-rule className="cs-entry-rule relative z-10 h-px origin-left" />
      </div>
    </div>,
    document.body,
  );
}
