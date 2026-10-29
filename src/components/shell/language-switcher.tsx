"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { locales, type Locale } from "@/i18n/locales";
import { usePathname, useRouter } from "@/i18n/navigation";

const names: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  sr: "Srpski",
  mk: "Македонски",
  uk: "Українська",
};

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-[11px] tracking-[0.16em] text-brass uppercase">
      <span className="sr-only">{t("language")}</span>
      <select
        className="h-11 max-w-44 bg-transparent pr-1 text-sm tracking-normal text-ink"
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
          <option key={code} value={code}>
            {names[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
