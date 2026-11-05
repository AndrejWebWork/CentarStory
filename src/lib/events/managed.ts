import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Copy, CulturalEvent } from "@/content/types";
import { listEvents } from "@/content/journeys";
import type { ManagedEvent } from "@/lib/events/managed-types";

export type { ManagedEvent } from "@/lib/events/managed-types";

export const ADMIN_COOKIE = "centarstory_admin";

const filePath = path.join(process.cwd(), "data", "managed-events.json");

function same(text: string): Copy {
  return { en: text, mk: text, sr: text, tr: text, uk: text, sq: text };
}

function skopjeDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Skopje",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function adminPassword() {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function passwordsMatch(given: string, expected: string) {
  return timingSafeEqual(digest(given), digest(expected));
}

export function adminToken(password: string) {
  return createHmac("sha256", password).update("centarstory-events").digest("hex");
}

export function isAdminCookie(value: string | undefined) {
  const password = adminPassword();
  if (!password || !value) return false;
  const expected = adminToken(password);
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function readManaged(): ManagedEvent[] {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as ManagedEvent[]) : [];
  } catch {
    return [];
  }
}

export function writeManaged(events: ManagedEvent[]) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(events, null, 2)}\n`, "utf8");
}

export function postedAsCultural(slug: string, today = new Date()) {
  const event = readManaged().find((item) => item.slug === slug);
  return event ? asCultural(event, today) : undefined;
}

export function postedEvents(today = new Date()) {
  return readManaged()
    .map((event) => asCultural(event, today))
    .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
}

export function asCultural(event: ManagedEvent, today = new Date()): CulturalEvent {
  const start = event.startDate || undefined;
  const end = event.endDate || start;
  const now = skopjeDay(today);
  let status: CulturalEvent["status"] = "recurring-confirm-dates";
  let nextDate: string | undefined;
  if (start && end) {
    if (now < start) {
      status = "upcoming";
      nextDate = start;
    } else if (now > end) {
      status = "past";
    } else {
      status = "ongoing";
    }
  }
  return {
    slug: event.slug,
    name: same(event.name),
    season: same(event.season || start || "—"),
    summary: same(event.summary),
    story: same(event.story || event.summary),
    venues: [],
    host: "municipality",
    officialUrl: event.officialUrl,
    imageUrl: event.imageUrl || undefined,
    links: event.links.filter((link) => link.url),
    placeLabel: event.placeLabel || undefined,
    status,
    startDate: start,
    endDate: end,
    nextDate,
    lastChecked: event.updatedAt.slice(0, 10),
    verificationStatus: "candidate",
  };
}

const letters: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ѓ: "gj", е: "e", ж: "zh", з: "z", ѕ: "dz",
  и: "i", ј: "j", к: "k", л: "l", љ: "lj", м: "m", н: "n", њ: "nj", о: "o", п: "p",
  р: "r", с: "s", т: "t", ќ: "kj", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", џ: "dzh", ш: "sh",
};

export function slugify(value: string) {
  let out = "";
  for (const char of value.toLowerCase()) out += letters[char] ?? char;
  return out
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function uniqueSlug(name: string, current?: string) {
  const base = slugify(name) || "nastan";
  if (current && (current === base || current.startsWith(`${base}-`))) return current;
  const taken = new Set([...readManaged().map((event) => event.slug), ...listEvents().map((event) => event.slug)]);
  if (current) taken.delete(current);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function removeLocalImage(url: string) {
  if (!url.startsWith("/events/")) return;
  const name = path.basename(url);
  if (!name || name !== url.slice("/events/".length)) return;
  const target = path.join(process.cwd(), "public", "events", name);
  try {
    unlinkSync(target);
  } catch {
    /* already gone */
  }
}

export function saveImage(slug: string, bytes: Buffer, mime: string) {
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const name = `${slug}.${ext}`;
  const dir = path.join(process.cwd(), "public", "events");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), bytes);
  return `/events/${name}`;
}

export function httpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}
