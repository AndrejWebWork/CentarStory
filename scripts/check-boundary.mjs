import { readFileSync } from "node:fs";

const raw = JSON.parse(
  readFileSync(process.env.TEMP + "/centar-boundary.json", "utf8"),
);
const ring = raw[0].geojson.coordinates[0];

function inside(lng, lat) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) hit = !hit;
  }
  return hit;
}

const points = [
  ["stone-bridge", 41.99646, 21.43312],
  ["macedonia-square", 41.9959, 21.43145],
  ["porta-macedonia", 41.99472, 21.43248],
  ["old-railway-station", 41.99115, 21.42562],
  ["mother-teresa-house", 41.9931, 21.42985],
  ["skopje-fortress", 42.0, 21.43345],
  ["cathedral-clement", 41.99855, 21.42555],
  ["officers-hall", 41.99485, 21.43015],
  ["vardar-quay", 41.99555, 21.4284],
  ["archaeological-museum", 41.99672, 21.43172],
  ["holocaust-memorial", 41.99844, 21.433355],
  ["macedonian-struggle", 41.99705, 21.43235],
  ["contemporary-art", 42.00255, 21.43255],
  ["opera-ballet", 41.99505, 21.4199],
  ["daut-pasha-hammam", 41.9984, 21.4353],
  ["sveti-spas", 42.0006, 21.4355],
  ["old-bazaar", 42.0006, 21.4368],
  ["debar-maalo", 41.9929, 21.4194],
  ["ristik-palace", 41.9954, 21.4289],
  ["macedonian-national-theatre", 41.9963, 21.4319],
  ["assembly", 41.9918, 21.4326],
  ["government", 41.9957, 21.439],
  ["city-park", 42.005, 21.421],
  ["national-library", 41.9978, 21.4395],
  ["gtc", 41.9943, 21.4295],
  ["philip-monument", 41.9952, 21.4335],
  ["justinian", 41.9961, 21.4328],
  ["feud-tower", 41.9938, 21.4312],
  ["st-demetrius", 41.9989, 21.4348],
  ["destan", 42.0009, 21.4372],
  ["pelister", 41.9935, 21.4258],
];

for (const [id, lat, lng] of points) {
  console.log(`${inside(lng, lat) ? "IN " : "OUT"}  ${id}  ${lat},${lng}`);
}
