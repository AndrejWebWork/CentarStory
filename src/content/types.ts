import type { Locale } from "@/i18n/locales";

export type Copy = Record<Locale, string>;

export type Coordinates = {
  lat: number;
  lng: number;
};

export type PlaceKind =
  | "monument"
  | "museum"
  | "memorial"
  | "worship"
  | "building"
  | "landscape";

export type InstitutionKind = "collection" | "memorial" | "stage";

export type Motif =
  | "bridge"
  | "rider"
  | "arch"
  | "clock"
  | "house"
  | "fort"
  | "dome"
  | "hall"
  | "museum"
  | "memorial"
  | "gallery"
  | "stage"
  | "river";

export type MunicipalityScope = "centar" | "nearby";
export type VerificationStatus = "confirmed" | "candidate";

export type Place = {
  slug: string;
  kinds: PlaceKind[];
  institution?: InstitutionKind;
  coordinates: Coordinates;
  era: Copy;
  name: Copy;
  eyebrow: Copy;
  summary: Copy;
  story: [Copy, Copy];
  visit: Copy;
  address: Copy;
  collection?: Copy;
  walkMinutes: number;
  related: string[];
  palette: [string, string];
  motif: Motif;
  municipality: MunicipalityScope;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  nearbyNote?: Copy;
  boundaryNote?: Copy;
};

export type Dish = {
  slug: string;
  name: Copy;
  eyebrow: Copy;
  summary: Copy;
  story: [Copy, Copy];
  eat: Copy;
  palette: [string, string];
  imageId?: string;
};

export type Restaurant = {
  slug: string;
  name: string;
  district: string;
  venueKind?: "kafana" | "national-house" | "kebab-grill" | "city-dining";
  serves: string[];
  summary: Copy;
  practical: Copy;
  hours?: Copy;
  osmOpeningHours?: string;
  municipality: MunicipalityScope;
  verificationStatus: VerificationStatus;
  nearbyNote?: Copy;
  coordinates?: Coordinates;
  address?: Copy;
  website?: string;
  phone?: string;
  imageId?: string;
  lastChecked: string;
};

export type District = {
  slug: string;
  name: Copy;
  summary: Copy;
  approach: Copy;
  coordinates: Coordinates;
  municipality: MunicipalityScope;
  nearbyNote?: Copy;
};

export type Walk = {
  slug: string;
  name: Copy;
  summary: Copy;
  story: Copy;
  stops: string[];
  duration: Copy;
};

export type EventStatus = "upcoming" | "ongoing" | "past" | "recurring-confirm-dates";
export type EventHost = "municipality" | "institution" | "city";

export type CulturalEvent = {
  slug: string;
  name: Copy;
  season: Copy;
  summary: Copy;
  story: Copy;
  venues: string[];
  host: EventHost;
  officialUrl: string;
  status: EventStatus;
  startDate?: string;
  endDate?: string;
  nextDate?: string;
  lastChecked: string;
  verificationStatus: VerificationStatus;
};
