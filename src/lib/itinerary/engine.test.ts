import assert from "node:assert/strict";
import { getSite } from "@/content/knowledge/catalog";
import { venues } from "@/content/knowledge/culinary";
import { aroundThemeDefault, aroundThemeForYear } from "@/lib/itinerary/around-theme";
import { planItinerary } from "@/lib/itinerary/engine";

function run() {
  const short = planItinerary({
    start: { kind: "site", slug: "macedonia-square" },
    themeId: "skopje-2014",
    budget: { mode: "stops", count: 3 },
  });
  assert.equal(short.startSlug, "macedonia-square");
  assert.ok(short.stops.length >= 2);
  assert.ok(short.stops.length <= 3);
  assert.ok(short.stops.some((stop) => stop.slug === "porta-macedonia"));
  assert.ok(short.legs.every((leg) => leg.explanation.en.trim().length > 0));
  assert.ok(short.legs.some((leg) => leg.historical));
  for (const stop of short.stops) {
    assert.ok(getSite(stop.slug)?.coordinates);
    assert.notEqual(stop.slug, "destan");
  }

  const longer = planItinerary({
    start: { kind: "site", slug: "macedonia-square" },
    themeId: "skopje-2014",
    budget: { mode: "duration", minutes: 180 },
  });
  assert.ok(longer.stops.length >= short.stops.length);

  const memory = planItinerary({
    start: { kind: "site", slug: "old-railway-station" },
    themeId: "1963-memory",
    budget: { mode: "stops", count: 3 },
  });
  assert.ok(memory.stops.some((stop) => stop.slug === "mother-teresa-house"));
  assert.ok(memory.legs.some((leg) => leg.kind === "same-event" && leg.historical));

  const monday = planItinerary({
    start: { kind: "site", slug: "stone-bridge" },
    themeId: "quay-museums",
    budget: { mode: "stops", count: 5 },
    today: new Date("2026-10-26T12:00:00+02:00"),
  });
  const holocaust = monday.stops.find((stop) => stop.slug === "holocaust-memorial");
  if (holocaust) assert.equal(holocaust.likelyClosedToday, true);

  const far = planItinerary({
    start: { kind: "gps", lat: 41.1, lng: 20.8 },
    themeId: "civic-axis",
    budget: { mode: "stops", count: 3 },
  });
  assert.equal(far.startSource, "fallback-square");
  assert.equal(far.startSlug, "macedonia-square");

  assert.ok(venues.find((venue) => venue.slug === "destan" && !venue.coordinates));

  assert.equal(aroundThemeDefault().themeId, "civic-axis");
  const shuffled = planItinerary({
    start: { kind: "site", slug: "macedonia-square" },
    themeId: "civic-axis",
    budget: { mode: "stops", count: 5 },
    shuffle: true,
  });
  assert.ok(shuffled.stops.length >= 2);
  for (const stop of shuffled.stops) {
    assert.ok(getSite(stop.slug)?.coordinates);
  }
  assert.equal(aroundThemeForYear(1958)?.themeId, "1963-memory");
  assert.equal(aroundThemeForYear(2014)?.themeId, "skopje-2014");
  assert.equal(aroundThemeForYear(1899), null);
  const fromYear = planItinerary({
    start: { kind: "site", slug: "macedonia-square" },
    themeId: aroundThemeForYear(2012)!.themeId,
    budget: { mode: "stops", count: 5 },
  });
  assert.ok(fromYear.stops.length >= 2);
  console.log("itinerary ok");
}

run();
