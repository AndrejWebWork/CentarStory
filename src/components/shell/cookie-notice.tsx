"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_COOKIE = "centarstory_consent";

function hasConsent() {
  return document.cookie.split("; ").some((part) => part.startsWith(`${CONSENT_COOKIE}=1`));
}

export function CookieNotice() {
  const t = useTranslations("legal");
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!hasConsent());
  }, []);

  function accept() {
    document.cookie = `${CONSENT_COOKIE}=1; Max-Age=31536000; Path=/; SameSite=Lax`;
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="region"
          aria-label={t("cookies")}
          initial={reduce ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 24 }}
          transition={{ duration: reduce ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 z-[70] bottom-[calc(7.75rem+env(safe-area-inset-bottom))] max-h-[min(18rem,calc(100dvh-10rem))] overflow-y-auto rounded-md border border-ink bg-foam p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)] sm:p-5 lg:inset-x-auto lg:right-5 lg:bottom-4 lg:w-[min(28rem,calc(100vw-2.5rem))] lg:max-h-[calc(100dvh-2rem)]"
        >
          <span className="mb-3 block h-1 w-10 rounded-full bg-copper" aria-hidden="true" />
          <p className="text-xs font-bold tracking-[0.14em] text-copper uppercase">{t("cookies")}</p>
          <p className="mt-2 text-sm leading-relaxed">{t("banner")}</p>
          <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center">
            <button type="button" className="cs-btn cs-btn-ink w-full min-[420px]:w-auto" onClick={accept}>
              {t("acceptCookies")}
            </button>
            <Link href="/cookies" className="cs-btn cs-btn-ghost w-full min-[420px]:w-auto">
              {t("readCookies")}
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
