import assert from "node:assert/strict";
import { getVisitOps } from "@/content/knowledge/visit-ops";
import { enjoyExample, wiziExample } from "@/content/mobility";
import { programmes } from "@/content/knowledge/programmes";
import { resolveEvent } from "@/lib/events/status";
import { openState } from "@/lib/visit/hours";

function run() {
  const thursday = new Date("2026-10-29T12:00:00+02:00");
  const monday = new Date("2026-10-26T12:00:00+02:00");
  const late = new Date("2026-10-29T18:30:00+01:00");

  const teresa = getVisitOps("mother-teresa-house");
  assert.ok(teresa?.windows);
  assert.equal(openState(teresa.windows, thursday).computed, true);
  assert.equal(openState(teresa.windows, thursday).open, true);
  assert.equal(openState(teresa.windows, monday).open, false);
  assert.equal(openState(teresa.windows, late).open, false);

  const amm = getVisitOps("archaeological-museum");
  assert.ok(amm);
  assert.equal(openState(amm.windows, thursday).computed, false);
  assert.equal(openState(amm.windows, thursday).open, null);

  const manevski = programmes.find((event) => event.slug === "manevski-40");
  assert.ok(manevski);
  assert.equal(resolveEvent(manevski, thursday).status, "ongoing");
  assert.equal(resolveEvent(manevski, new Date("2026-11-01T12:00:00+01:00")).status, "past");

  const picasso = programmes.find((event) => event.slug === "picasso-skopje-2026");
  assert.ok(picasso);
  assert.equal(resolveEvent(picasso, thursday).status, "past");

  assert.equal(enjoyExample(10), 129);
  const taxi = wiziExample(1);
  assert.equal(taxi.assumedRoadKm, 1.35);
  assert.equal(taxi.mkd, 107);

  console.log("visit ops ok");
}

run();
