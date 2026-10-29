import assert from "node:assert/strict";
import { approximateWalkMeters, loadWalkingPath, pedestrianNavigation } from "@/lib/mapping/walk";

const points = [
  { lat: 41.9956947, lng: 21.4312483 },
  { lat: 41.9944508, lng: 21.4324403 },
];

async function run() {
  const original = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error("offline");
  }) as typeof fetch;
  const failed = await loadWalkingPath(points);
  assert.equal(failed.source, "direct");
  assert.equal(failed.minutes, null);
  assert.ok((failed.meters ?? 0) > 0);
  assert.equal(failed.meters, approximateWalkMeters(points));

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ routes: [] }), { status: 200 })) as typeof fetch;
  const empty = await loadWalkingPath(points);
  assert.equal(empty.source, "direct");

  globalThis.fetch = (async () =>
    new Response("no", { status: 503 })) as typeof fetch;
  const down = await loadWalkingPath(points);
  assert.equal(down.source, "direct");
  assert.equal(down.minutes, null);

  globalThis.fetch = original;
  const nav = pedestrianNavigation(points);
  assert.ok(nav.osm?.includes("fossgis_osrm_foot"));
  assert.ok(nav.google?.includes("travelmode=walking"));
  console.log("walk fallback ok");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
