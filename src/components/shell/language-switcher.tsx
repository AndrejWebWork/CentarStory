"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, type Locale } from "@/i18n/locales";
import { usePathname, useRouter } from "@/i18n/navigation";

const names: Record<Locale, string> = {
  en: "EN · English",
  tr: "TR · Türkçe",
  sr: "SR · Srpski",
  mk: "МК · Македонски",
  uk: "УК · Українська",
};

const codes: Record<Locale, string> = {
  en: "EN",
  tr: "TR",
  sr: "SR",
  mk: "МК",
  uk: "УК",
};

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 430px)");
    const apply = () => setCompact(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <label className="cs-lang flex w-fit max-w-full min-w-0 items-center border border-white/12 bg-white/5 px-2 text-[11px] font-semibold tracking-[0.04em] sm:px-3">
      <span className="sr-only">{t("language")}</span>
      <select
        className="h-11 max-w-full min-w-0 bg-transparent pr-1 text-base tracking-[0.04em] text-foam sm:h-9 sm:max-w-44 sm:text-xs"
        value={locale}
        aria-label={t("language")}
        title={t("scriptStrategy")}
        onChange={(event) => {
          const next = event.target.value as Locale;
          const query = search.toString();
          const href = query ? `${pathname}?${query}` : pathname;
          router.replace(href, { locale: next });
        }}
      >
        {locales.map((code) => (
          <option key={code} value={code} className="bg-foam text-ink">
            {compact ? codes[code] : names[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
