import { L } from "@/content/copy";
import type { Copy } from "@/content/types";

/** Printed closed weekdays from verified visit copy. Sunday = 0. */
const PRINTED_CLOSED: Record<string, { weekdays: number[]; note: Copy }> = {
  "holocaust-memorial": {
    weekdays: [1],
    note: L(
      "The Fund prints Monday as closed. Confirm at the door.",
      "Фондот печати понеделник како затворен. Потврдете на врата.",
      "Fond štampa ponedeljak kao zatvoren. Potvrdite na vratima.",
      "Fon Pazartesi’yi kapalı basar. Kapıda doğrulayın.",
      "Фонд друкує понеділок як зачинений. Підтвердьте на дверях.",
     "Fondi e shtyp të hënën si të mbyllur. Konfirmoni te dera."),
  },
  "mother-teresa-house": {
    weekdays: [1],
    note: L(
      "The house publishes Tuesday–Sunday 10:00–18:00. Monday is not listed as open.",
      "Куќата објавува вторник–недела 10:00–18:00. Понеделник не е наведен како отворен.",
      "Kuća objavljuje utorak–nedelja 10:00–18:00. Ponedeljak nije naveden kao otvoren.",
      "Ev Salı–Pazar 10:00–18:00 yayımlar. Pazartesi açık olarak listelenmez.",
      "Дім публікує вівторок–неділя 10:00–18:00. Понеділок не зазначено як відчинений.",
     "Shtëpia publikon e martë–e diel 10:00–18:00. E hëna nuk është e listuar si e hapur."),
  },
};

export function openingFor(slug: string, today: Date) {
  const row = PRINTED_CLOSED[slug];
  if (!row) return { likelyClosedToday: false as const, openingNote: undefined };
  return {
    likelyClosedToday: row.weekdays.includes(today.getDay()),
    openingNote: row.note,
  };
}
