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
          initial={reduce ? false : { opacity: 0, y: 28, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 24, rotate: 4 }}
          transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="cs-cookie fixed z-[70] bottom-[calc(7.75rem+env(safe-area-inset-bottom))] left-3 right-3 lg:inset-x-auto lg:right-5 lg:bottom-4 lg:w-[min(26rem,calc(100vw-2.5rem))]"
        >
          <div className="cs-biscuit" aria-hidden="true">
            <span className="cs-biscuit__bite" />
            <span className="cs-biscuit__crumb cs-biscuit__crumb--a" />
            <span className="cs-biscuit__crumb cs-biscuit__crumb--b" />
          </div>
          <div className="cs-cookie__card">
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
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
