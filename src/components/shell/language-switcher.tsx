"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/i18n/locales";
import { usePathname, useRouter } from "@/i18n/navigation";

const names: Record<Locale, string> = {
  en: "EN · English",
  tr: "TR · Türkçe",
  sr: "SR · Srpski",
  mk: "МК · Македонски",
  uk: "УК · Українська",
};

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();

  return (
    <label className="flex items-center rounded-full border border-white/12 bg-white/5 px-3 text-[11px] font-semibold tracking-[0.08em]">
      <span className="sr-only">{t("language")}</span>
      <select
        className="h-9 max-w-44 bg-transparent pr-1 text-xs tracking-[0.12em] text-foam uppercase"
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
            {names[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
