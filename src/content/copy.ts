import { defaultLocale, isLocale, type Locale } from "@/i18n/locales";
import type { Copy } from "@/content/types";

export function L(
  en: string,
  mk: string,
  sr: string,
  tr: string,
  uk: string,
  sq: string,
): Copy {
  return { en, mk, sr, tr, uk, sq };
}

export function pick(copy: Copy, locale: string): string {
  if (isLocale(locale)) return copy[locale];
  return copy[defaultLocale];
}

export function localeOf(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}
