import { defaultLocale, isLocale, type Locale } from "@/i18n/locales";

const tags: Record<Locale, string> = {
  en: "en-GB",
  tr: "tr-TR",
  sr: "sr-Latn-RS",
  mk: "mk-MK",
  uk: "uk-UA",
  sq: "sq-AL",
};

export function intlTag(locale: string) {
  return isLocale(locale) ? tags[locale] : tags[defaultLocale];
}

export function formatIsoDay(iso: string, locale: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat(intlTag(locale), {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 11)));
}

export function formatMkd(amount: number, locale: string) {
  const number = new Intl.NumberFormat(intlTag(locale), {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 1,
  }).format(amount);
  return `${number} MKD`;
}

export function formatCount(amount: number, locale: string) {
  return new Intl.NumberFormat(intlTag(locale)).format(amount);
}
