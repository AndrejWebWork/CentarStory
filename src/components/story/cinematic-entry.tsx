"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export function CinematicEntry({
  active,
  index,
  eyebrow,
  title,
  era,
  coordinates,
}: {
  active: boolean;
  index: string;
  eyebrow: string;
  title: string;
  era: string;
  coordinates: string;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setOpen(false), 1850);
    return () => window.clearTimeout(timer);
  }, [active, reduce]);

  if (!active || reduce) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-between bg-ink p-6 text-foam sm:p-12"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          aria-hidden="true"
        >
          <div className="flex items-center justify-between border-b border-foam/25 pb-4 text-[10px] tracking-[0.26em] text-brass uppercase">
            <span>Folio {index} · {eyebrow}</span>
            <span>{coordinates}</span>
          </div>
          <div>
            <motion.p
              className="text-xs tracking-[0.24em] text-cobalt uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {era}
            </motion.p>
            <motion.h2
              className="mt-4 max-w-5xl font-display text-6xl leading-[0.84] tracking-tight sm:text-8xl lg:text-9xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {title}
            </motion.h2>
          </div>
          <motion.div
            className="h-0.5 bg-cobalt"
            initial={{ scaleX: 0, transformOrigin: "0% 50%" }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
