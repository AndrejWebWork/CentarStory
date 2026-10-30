import type { Copy, Coordinates, InstitutionKind, Motif, PlaceKind } from "@/content/types";

export type ClaimKind = "documented-fact" | "legend-folklore" | "interpretation" | "unverified";

export type VerificationStatus = "confirmed" | "candidate";

export type MunicipalityScope = "centar" | "nearby";

export type SourceKind =
  | "official"
  | "register"
  | "institutional"
  | "academic"
  | "geographic"
  | "journalism"
  | "secondary";

export type CoordinatePrecision = "nominatim" | "polygon-checked" | "approximate";

export type EntityType =
  | "monument"
  | "memorial"
  | "public-space"
  | "historic-building"
  | "religious-building"
  | "museum"
  | "memorial-house"
  | "cultural-institution"
  | "landscape"
  | "plaque";

export type MonumentCategory =
  | "monumental-statue"
  | "historical-figure"
  | "military-monument"
  | "bust"
  | "public-sculpture"
  | "memorial-monument"
  | "memorial-plaque"
  | "relief-panel"
  | "obelisk-column"
  | "historical-marker"
  | "sculptural-ensemble"
  | "war-tragedy-memorial"
  | "writer-artist-scientist"
  | "public-artwork"
  | "architectural-landmark"
  | "cultural-institution";

export type TranslationStatus = "complete" | "partial";

export type SourceRecord = {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  accessed: string;
  kind: SourceKind;
  language: string;
  notes?: string;
};

export type Claim = {
  id: string;
  kind: ClaimKind;
  text: Copy;
  sourceIds: string[];
};

export type Milestone = {
  id: string;
  date: string;
  precision: "year" | "month" | "day" | "range" | "century";
  label: Copy;
  sourceIds: string[];
  kind: ClaimKind;
};

export type MediaAsset = {
  id: string;
  fileTitle: string;
  url: string;
  pageUrl: string;
  credit: string;
  license: string;
  licenseUrl: string;
  attributionRequired: boolean;
  caption: Copy;
  authenticPhotograph: true;
  verified: boolean;
  captured?: string;
};

export type VisitorInfo = {
  hours?: Copy;
  tickets?: Copy;
  phone?: string;
  website?: string;
  notes?: Copy;
};

export type SiteRecord = {
  id: string;
  slug: string;
  entityType: EntityType;
  monumentCategory?: MonumentCategory;
  osmId?: string;
  wikidataId?: string;
  installationDate?: string;
  materials?: Copy;
  missingOrDisputed?: Copy;
  kinds: PlaceKind[];
  institution?: InstitutionKind;
  officialName: Copy;
  nameMk: string;
  alternativeNames: string[];
  transliterations: string[];
  coordinates: Coordinates;
  coordinateSourceId: string;
  coordinatePrecision: CoordinatePrecision;
  municipality: MunicipalityScope;
  address: Copy;
  historicalPeriod: Copy;
  commemorates?: Copy;
  creator?: Copy;
  architecturalStyle?: Copy;
  architecturalFeatures?: Copy;
  significance: Copy;
  milestones: Milestone[];
  claims: Claim[];
  myths: Claim[];
  related: string[];
  images: string[];
  visitor?: VisitorInfo;
  translationStatus: TranslationStatus;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  nearbyNote?: Copy;
  boundaryNote?: Copy;
  summary: Copy;
  story: [Copy, Copy];
  visit: Copy;
  collection?: Copy;
  eyebrow: Copy;
  era: Copy;
  palette: [string, string];
  motif: Motif;
};

export type DishRecord = {
  id: string;
  slug: string;
  name: Copy;
  nameMk: string;
  eyebrow: Copy;
  summary: Copy;
  story: [Copy, Copy];
  eat: Copy;
  palette: [string, string];
  imageId?: string;
  claims: Claim[];
  myths: Claim[];
  verificationStatus: VerificationStatus;
  lastChecked: string;
  translationStatus: TranslationStatus;
};

export type VenueKind = "kafana" | "national-house" | "kebab-grill" | "city-dining";

export type VenueRecord = {
  id: string;
  slug: string;
  name: string;
  district: string;
  venueKind?: VenueKind;
  serves: string[];
  summary: Copy;
  practical: Copy;
  hours?: Copy;
  osmOpeningHours?: string;
  municipality: MunicipalityScope;
  coordinates?: Coordinates;
  address?: Copy;
  website?: string;
  phone?: string;
  sourceIds: string[];
  imageId?: string;
  verificationStatus: VerificationStatus;
  lastChecked: string;
  nearbyNote?: Copy;
};

export type DistrictRecord = {
  id: string;
  slug: string;
  name: Copy;
  summary: Copy;
  approach: Copy;
  coordinates: Coordinates;
  municipality: MunicipalityScope;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
  lastChecked: string;
  nearbyNote?: Copy;
};

export type EventHost = "municipality" | "institution" | "city";

export type EventCalendarKind = "annual-fixed-date" | "annual-season" | "recurring" | "dated-run";

export type EventCalendar = {
  kind: EventCalendarKind;
  month?: number;
  day?: number;
  /** ISO date of a verified dated instance. Absent when this year's dates were not confirmed. */
  startDate?: string;
  endDate?: string;
};

export type EventRecord = {
  id: string;
  slug: string;
  name: Copy;
  season: Copy;
  summary: Copy;
  story: Copy;
  venues: string[];
  host: EventHost;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
  lastChecked: string;
  translationStatus: TranslationStatus;
  officialUrl: string;
  calendar: EventCalendar;
};

export type RelationshipKind =
  | "same-person"
  | "same-event"
  | "same-period"
  | "same-creator"
  | "architectural-movement"
  | "documented-ensemble"
  | "institution-link"
  | "documented-route"
  | "geographic-proximity";

export type RelationshipRecord = {
  id: string;
  kind: RelationshipKind;
  from: string;
  to: string;
  /** False for practical or programmatic links that must not be read as historical proof. */
  historical: boolean;
  explanation: Copy;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
  themeIds: string[];
};

export type RouteRecord = {
  id: string;
  slug: string;
  name: Copy;
  summary: Copy;
  story: Copy;
  stops: string[];
  duration: Copy;
  theme: string;
  sourceIds: string[];
  verificationStatus: VerificationStatus;
  lastChecked: string;
};
