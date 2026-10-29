import type { StyleSpecification } from "maplibre-gl";

/** OpenFreeMap liberty — vector tiles, OSM-based, attribution required. */
export const OPENFREEMAP_LIBERTY = "https://tiles.openfreemap.org/styles/liberty";

/**
 * OSM raster fallback. Use when the vector style fails or MAP_STYLE_URL is unset
 * and OpenFreeMap is unreachable. OSM tile usage policy applies; this is not
 * an unlimited production endpoint.
 */
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  name: "OpenStreetMap raster",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export const MAP_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://openfreemap.org/">OpenFreeMap</a>';

export const OSM_ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export function mapStyle(): string | StyleSpecification {
  const custom = process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim();
  if (custom) return custom;
  return OPENFREEMAP_LIBERTY;
}

export const CENTAR_VIEW = {
  longitude: 21.4314,
  latitude: 41.9962,
  zoom: 14.4,
} as const;
