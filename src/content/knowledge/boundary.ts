import { CENTAR_BBOX, CENTAR_OSM_RELATION, CENTAR_POLYGON } from "@/content/knowledge/polygon";
import type { Coordinates } from "@/content/types";

export { CENTAR_BBOX, CENTAR_OSM_RELATION, CENTAR_POLYGON };

/** Macedonia Square, OSM Nominatim 2026-10-29. */
export const MACEDONIA_SQUARE: Coordinates = {
  lat: 41.9956947,
  lng: 21.4312483,
};

export function pointInCentar(lat: number, lng: number): boolean {
  const ring = CENTAR_POLYGON;
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) hit = !hit;
  }
  return hit;
}

export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function walkMinutesFromSquare(point: Coordinates): number {
  const meters = haversineMeters(MACEDONIA_SQUARE, point);
  if (meters < 80) return 0;
  return Math.max(1, Math.round((meters * 1.35) / 80));
}
