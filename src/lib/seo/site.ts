import { defaultLocale, locales } from "@/i18n/locales";

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function localePath(locale: string, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return normalized;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export function localeHref(locale: string, path: string) {
  return `${siteOrigin()}${localePath(locale, path)}`;
}

export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localeHref(locale, path);
  }
  languages["x-default"] = localeHref(defaultLocale, path);
  return languages;
}
