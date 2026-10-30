export const jspHow = {
  faq: "https://skopjebus.mk/en/%d1%87%d0%bf%d0%bf/",
  announcements: "https://skopjebus.mk/en/izvestuvanja/",
  webTickets: "https://jsp.modeshift.com",
  playStore: "https://play.google.com/store/apps/details?id=com.modeshift.jsp",
  lastChecked: "2026-10-29",
} as const;

export const ammPublishedStops = {
  source: "https://amm.org.mk/en/plan-your-visit/",
  lastChecked: "2026-10-29",
  stops: [
    { name: "Kale", lines: "2, 2A, 8, 12, 19" },
    { name: "Record", lines: "3, 3B, 4, 4A, 5, 7, 7B, 15, 21, 22, 24, 26, 50, 57, 57A, 59" },
    { name: "MNT", lines: "16, 26, 50, 57, 57A, 17A" },
  ],
} as const;

export const enjoyTariff = {
  startMkd: 30,
  perMinuteMkd: 9.9,
  reservationPer10MinMkd: 10,
  pausePerMinuteMkd: 6,
  url: "https://enjoyscooters.com/pricing/",
  site: "https://enjoyscooters.com/",
  playStore: "https://play.google.com/store/apps/details?id=com.eenjoyscooter.android",
  appStore: "https://apps.apple.com/mk/app/e-enjoy-live-the-moment/id6449702253",
  lastChecked: "2026-10-29",
} as const;

export const binbin = {
  help: "https://www.binbin.tech/en/help/",
  site: "https://www.binbin.tech/",
  playStore: "https://play.google.com/store/apps/details?id=com.BINBIN",
  appStore: "https://apps.apple.com/app/binbin-taxi-scooter/id1483635924",
  lastChecked: "2026-10-29",
} as const;

export const wiziTariff = {
  startMkd: 60,
  perKmMkd: 35,
  waitingHourMkd: 420,
  phone: "+389 2 277 6800",
  tel: "tel:+38922776800",
  url: "https://wizi.hr/en/cities/skopje/",
  lastChecked: "2026-10-29",
} as const;

export const calendarLinks = [
  { id: "msu", href: "https://msu.mk/", labelKey: "calMsu" as const },
  { id: "opera", href: "https://operabalet.mk/", labelKey: "calOpera" as const },
  { id: "city", href: "https://skopje.gov.mk/", labelKey: "calCity" as const },
  { id: "centar", href: "https://www.centar.gov.mk/", labelKey: "calCentar" as const },
];

export function enjoyExample(minutes: number) {
  const total = enjoyTariff.startMkd + enjoyTariff.perMinuteMkd * minutes;
  return Math.round(total * 10) / 10;
}

export function wiziExample(straightLineKm: number, roadFactor = 1.35) {
  const assumedRoadKm = straightLineKm * roadFactor;
  const total = wiziTariff.startMkd + wiziTariff.perKmMkd * assumedRoadKm;
  return { assumedRoadKm: Math.round(assumedRoadKm * 100) / 100, mkd: Math.round(total) };
}
