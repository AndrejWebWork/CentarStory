"use client";

import { MapPin } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const DISMISS = "centarstory_location";

export function LocationPrompt() {
  const t = useTranslations("common");
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const phone = window.matchMedia("(max-width: 1023px)").matches;
    if (!phone || !navigator.geolocation) return;
    if (sessionStorage.getItem(DISMISS) === "1") return;

    const permissions = navigator.permissions;
    if (!permissions?.query) {
      setOpen(true);
      return;
    }
    permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (status.state === "granted") return;
        setOpen(true);
      })
      .catch(() => setOpen(true));
  }, []);

  function allow() {
    navigator.geolocation.getCurrentPosition(
      () => {
        sessionStorage.setItem(DISMISS, "1");
        setOpen(false);
      },
      () => {
        sessionStorage.setItem(DISMISS, "1");
        setOpen(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 },
    );
  }

  function later() {
    sessionStorage.setItem(DISMISS, "1");
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-labelledby="location-prompt-title"
          initial={reduce ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 z-[65] top-[calc(4.75rem+env(safe-area-inset-top))] border border-ink bg-foam p-4 shadow-[0_18px_40px_rgba(15,23,42,0.16)] lg:hidden"
        >
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cobalt text-foam">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p id="location-prompt-title" className="font-display text-xl leading-none">
                {t("locationTitle")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("locationBody")}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row">
            <button type="button" className="cs-btn cs-btn-cobalt w-full min-[420px]:w-auto" onClick={allow}>
              {t("locationAllow")}
            </button>
            <button type="button" className="cs-btn cs-btn-ghost w-full min-[420px]:w-auto" onClick={later}>
              {t("locationLater")}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
