import type { Coordinates } from "@/content/types";
import { haversineMeters } from "@/content/knowledge/boundary";

export type WalkStep = {
  kind: string;
  street: string;
  meters: number;
  lat: number;
  lng: number;
};

export type WalkPath = {
  positions: [number, number][];
  minutes: number | null;
  meters: number | null;
  source: "street" | "direct";
  steps: WalkStep[];
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

export async function loadWalkingPath(points: Coordinates[], withSteps = false): Promise<WalkPath> {
  const approx = approximateWalkMeters(points);
  const direct: WalkPath = {
    positions: points.map((point) => [point.lat, point.lng]),
    minutes: null,
    meters: null,
    source: "direct",
    steps: [],
  };

  if (points.length < 2) return direct;

  const coord = points.map((point) => `${point.lng},${point.lat}`).join(";");
  const stepsQuery = withSteps ? "&steps=true" : "";
  const url = `${OSRM_FOOT}/${coord}?overview=full&geometries=geojson${stepsQuery}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return { ...direct, meters: approx };
    const data = (await response.json()) as {
      routes?: {
        duration?: number;
        distance?: number;
        geometry?: { coordinates?: [number, number][] };
        legs?: {
          steps?: {
            name?: string;
            distance?: number;
            maneuver?: { type?: string; modifier?: string; location?: [number, number] };
          }[];
        }[];
      }[];
    };
    const route = data.routes?.[0];
    const line = route?.geometry?.coordinates;
    if (!route || !line?.length) return { ...direct, meters: approx };
    const rawSteps = route.legs?.[0]?.steps ?? [];
    return {
      positions: line.map(([lng, lat]) => [lat, lng]),
      minutes:
        typeof route.duration === "number" ? Math.max(1, Math.round(route.duration / 60)) : null,
      meters: typeof route.distance === "number" ? Math.round(route.distance) : null,
      source: "street",
      steps: rawSteps.flatMap((step) => {
        const location = step.maneuver?.location;
        if (!location) return [];
        const [lng, lat] = location;
        return [
          {
            kind: maneuverKind(step.maneuver?.type, step.maneuver?.modifier),
            street: (step.name ?? "").trim(),
            meters: typeof step.distance === "number" ? Math.round(step.distance) : 0,
            lat,
            lng,
          },
        ];
      }),
    };
  } catch {
    return { ...direct, meters: approx };
  }
}

function maneuverKind(type?: string, modifier?: string) {
  if (type === "arrive") return "arrive";
  if (type === "roundabout" || type === "rotary" || type === "exit roundabout") return "roundabout";
  if (type === "depart") return "depart";
  if (modifier === "uturn") return "uturn";
  if (modifier === "sharp left") return "sharp-left";
  if (modifier === "left") return "left";
  if (modifier === "slight left") return "slight-left";
  if (modifier === "sharp right") return "sharp-right";
  if (modifier === "right") return "right";
  if (modifier === "slight right") return "slight-right";
  return "straight";
}

/** The next maneuver the walker has not yet passed. */
export function upcomingStep(user: Coordinates, steps: WalkStep[]): WalkStep | null {
  if (steps.length === 0) return null;
  let index = 0;
  for (let i = 0; i < steps.length - 1; i += 1) {
    const here = haversineMeters(user, steps[i]);
    const next = haversineMeters(user, steps[i + 1]);
    if (next + 12 < here) index = i + 1;
    else break;
  }
  const step = steps[index];
  return step.kind === "arrive" ? null : step;
}

/** Distances a walking voice would actually say, so it does not chatter on every GPS tick. */
export function spokenMeters(meters: number) {
  if (!Number.isFinite(meters) || meters < 15) return 10;
  if (meters < 35) return 20;
  if (meters < 75) return 50;
  if (meters < 150) return 100;
  if (meters < 250) return 200;
  if (meters < 400) return 300;
  if (meters < 650) return 500;
  return Math.min(2000, Math.round(meters / 100) * 100);
}

export function walkingDirections(lat: number, lng: number) {
  const google = new URL("https://www.google.com/maps/dir/");
  google.searchParams.set("api", "1");
  google.searchParams.set("destination", `${lat},${lng}`);
  google.searchParams.set("travelmode", "walking");
  return google.toString();
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
