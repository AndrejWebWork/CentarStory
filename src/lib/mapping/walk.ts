import type { Coordinates } from "@/content/types";
import { haversineMeters } from "@/content/knowledge/boundary";

export type WalkPath = {
  positions: [number, number][];
  minutes: number | null;
  meters: number | null;
  source: "street" | "direct";
};

/** Straight-line length with a footpath factor. Never present as street walking distance. */
export function approximateWalkMeters(points: Coordinates[]): number {
  let meters = 0;
  for (let i = 1; i < points.length; i += 1) {
    meters += haversineMeters(points[i - 1], points[i]);
  }
  return Math.round(meters * 1.35);
}

export function approximateWalkMinutes(meters: number): number {
  if (meters < 80) return 0;
  return Math.max(1, Math.round(meters / 80));
}

const OSRM_FOOT = "https://router.project-osrm.org/route/v1/foot";

export async function loadWalkingPath(points: Coordinates[]): Promise<WalkPath> {
  const approx = approximateWalkMeters(points);
  const direct: WalkPath = {
    positions: points.map((point) => [point.lat, point.lng]),
    minutes: null,
    meters: null,
    source: "direct",
  };

  if (points.length < 2) return direct;

  const coord = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const url = `${OSRM_FOOT}/${coord}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url);
    if (!response.ok) return { ...direct, meters: approx };
    const data = (await response.json()) as {
      routes?: {
        duration?: number;
        distance?: number;
        geometry?: { coordinates?: [number, number][] };
      }[];
    };
    const route = data.routes?.[0];
    const line = route?.geometry?.coordinates;
    if (!route || !line?.length) return { ...direct, meters: approx };
    return {
      positions: line.map(([lng, lat]) => [lat, lng]),
      minutes:
        typeof route.duration === "number" ? Math.max(1, Math.round(route.duration / 60)) : null,
      meters: typeof route.distance === "number" ? Math.round(route.distance) : null,
      source: "street",
    };
  } catch {
    return { ...direct, meters: approx };
  }
}

export function pedestrianNavigation(points: Coordinates[]) {
  if (points.length === 0) return { osm: null, google: null };
  const osmRoute = points.map((point) => `${point.lat},${point.lng}`).join(";");
  const origin = points[0];
  const destination = points[points.length - 1];
  const waypoints = points.slice(1, -1);
  const google = new URL("https://www.google.com/maps/dir/");
  google.searchParams.set("api", "1");
  google.searchParams.set("travelmode", "walking");
  google.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  google.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  if (waypoints.length) {
    google.searchParams.set(
      "waypoints",
      waypoints.map((point) => `${point.lat},${point.lng}`).join("|"),
    );
  }
  return {
    osm: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=${osmRoute}`,
    google: google.toString(),
  };
}
