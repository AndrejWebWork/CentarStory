export type Fare = {
  id: string;
  amount: string;
  labelKey:
    | "fareAppSingle"
    | "farePaperSingle"
    | "fareDay"
    | "fareNight"
    | "fareTenCity"
    | "fareTenAll"
    | "fareWeekCity"
    | "fareWeekAll"
    | "fareCardPlain"
    | "fareCardNamed";
};

export const jspFares: Fare[] = [
  { id: "app-single", amount: "35 MKD", labelKey: "fareAppSingle" },
  { id: "paper-single", amount: "50 MKD", labelKey: "farePaperSingle" },
  { id: "day", amount: "120 MKD", labelKey: "fareDay" },
  { id: "night", amount: "50 MKD", labelKey: "fareNight" },
  { id: "ten-city", amount: "250 MKD", labelKey: "fareTenCity" },
  { id: "ten-all", amount: "300 MKD", labelKey: "fareTenAll" },
  { id: "week-city", amount: "500 MKD", labelKey: "fareWeekCity" },
  { id: "week-all", amount: "600 MKD", labelKey: "fareWeekAll" },
  { id: "card-plain", amount: "150 MKD", labelKey: "fareCardPlain" },
  { id: "card-named", amount: "200 MKD", labelKey: "fareCardNamed" },
];

export const transportLinks = {
  priceList: "https://skopjebus.mk/en/price-list/",
  planner: "https://skopjebus.mk/en/",
  phone: "tel:080015115",
  phoneDisplay: "0800 15 115",
  desk: "tel:+38923122634",
  deskDisplay: "02 312 26 34",
  fareListCaptured: "February 2026",
  fareListChecked: "2026-10-29",
} as const;

export const airportTaxi = {
  amount: "1,500 MKD",
  distance: "23 km",
  listDate: "9 February 2024",
} as const;
