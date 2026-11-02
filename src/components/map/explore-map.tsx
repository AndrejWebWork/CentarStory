"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  AttributionControl,
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";
import type { FilterSpecification, Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CENTAR_BBOX, CENTAR_POLYGON } from "@/content/knowledge/polygon";
import {
  CENTAR_VIEW,
  MAP_ATTRIBUTION,
  OSM_ATTRIBUTION,
  OSM_RASTER_STYLE,
  mapStyle,
} from "@/lib/mapping/style";

export type AtlasMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  tone: "site" | "kitchen" | "nearby" | "candidate";
};

export type MapBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
  zoom: number;
};

const boundaryData = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [CENTAR_POLYGON],
  },
};

function signedArea(ring: readonly [number, number][]) {
  let sum = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

const centarHole = signedArea(CENTAR_POLYGON) > 0 ? [...CENTAR_POLYGON].reverse() : [...CENTAR_POLYGON];

/** Dims the city outside the municipality so Centar reads as the subject. */
const outsideMask = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      [
        [20.6, 41.3],
        [22.4, 41.3],
        [22.4, 42.5],
        [20.6, 42.5],
        [20.6, 41.3],
      ],
      centarHole,
    ],
  },
};

function folioCamera(reduce: boolean) {
  return reduce ? { pitch: 0, bearing: 0 } : { pitch: 50, bearing: -18 };
}

function sameBounds(a: MapBounds, b: MapBounds) {
  return (
    Math.abs(a.west - b.west) < 1e-6 &&
    Math.abs(a.south - b.south) < 1e-6 &&
    Math.abs(a.east - b.east) < 1e-6 &&
    Math.abs(a.north - b.north) < 1e-6 &&
    Math.abs(a.zoom - b.zoom) < 1e-3
  );
}

function lineSignature(line: [number, number][] | null) {
  if (!line || line.length < 2) return "";
  return line.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join(";");
}

function pinClass(active: boolean, tone: AtlasMarker["tone"]) {
  const extra =
    tone === "kitchen"
      ? " is-kitchen"
      : tone === "nearby" || tone === "candidate"
        ? " is-nearby"
        : "";
  return `cs-pin${active ? " is-active" : ""}${extra}`;
}

function paint(map: MapLibreMap, id: string, property: string, value: unknown) {
  try {
    map.setPaintProperty(id, property, value);
  } catch {
    /* This style has no such layer or property. */
  }
}

function applyCentarCartography(map: MapLibreMap) {
  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    const id = layer.id;
    if (layer.type === "background") {
      paint(map, id, "background-color", "#efe4d2");
    } else if (id === "natural_earth") {
      try {
        map.setLayoutProperty(id, "visibility", "none");
      } catch {
        /* Raster hillshade is optional. */
      }
    } else if (layer.type === "fill") {
      if (id === "water") paint(map, id, "fill-color", "#1c6478");
      else if (id === "park" || id === "landcover_grass") {
        paint(map, id, "fill-color", "#b7c9a4");
        paint(map, id, "fill-opacity", 0.9);
      } else if (id === "landcover_wood") {
        paint(map, id, "fill-color", "#7f9874");
        paint(map, id, "fill-opacity", 0.82);
      } else if (id === "landuse_residential") {
        paint(map, id, "fill-color", "#e7d7c2");
        paint(map, id, "fill-opacity", 0.72);
      } else if (id === "landuse_hospital" || id === "landuse_school") {
        paint(map, id, "fill-color", "#ead8c4");
      } else if (id === "building") {
        paint(map, id, "fill-color", "#f0e2cc");
        paint(map, id, "fill-outline-color", "#b89a78");
      } else if (id.startsWith("landuse_") || id.startsWith("landcover_")) {
        paint(map, id, "fill-color", "#ddd0bc");
      }
    } else if (id === "building-3d") {
      paint(map, id, "fill-extrusion-color", "#d9c3a4");
      paint(map, id, "fill-extrusion-opacity", 0.96);
      try {
        map.setLayerZoomRange(id, 13.2, 24);
      } catch {
        /* Keep the style's own zoom range. */
      }
    } else if (layer.type === "line") {
      if (id.startsWith("waterway")) {
        paint(map, id, "line-color", "#154e60");
      } else if (id.startsWith("boundary")) {
        paint(map, id, "line-opacity", 0.2);
      } else if (id.includes("rail")) {
        paint(map, id, "line-color", "#8d7b68");
      } else if (id.includes("path") || id.includes("pedestrian") || id.includes("service_track")) {
        paint(map, id, "line-color", id.includes("casing") ? "#cfc3b0" : "#f7f1e6");
      } else if (id.includes("casing")) {
        const boulevard = /motorway|trunk|primary|secondary/.test(id);
        paint(map, id, "line-color", boulevard ? "#c47a45" : "#d9cbb8");
      } else if (id.startsWith("road_") || id.startsWith("bridge_") || id.startsWith("tunnel_")) {
        const boulevard = /motorway|trunk|primary/.test(id);
        paint(map, id, "line-color", boulevard ? "#f8e2c4" : "#fffaf3");
      }
    } else if (layer.type === "symbol") {
      const clutter =
        id.startsWith("poi_") ||
        id.startsWith("highway-shield") ||
        id.startsWith("road_shield") ||
        id.startsWith("label_city") ||
        id.startsWith("label_state") ||
        id.startsWith("label_country") ||
        id === "airport";
      if (clutter) {
        try {
          map.setLayoutProperty(id, "visibility", "none");
        } catch {
          /* Symbol layer cannot be hidden. */
        }
      } else {
        paint(map, id, "text-color", "#2a2118");
        paint(map, id, "text-halo-color", "#f6efe4");
        paint(map, id, "text-halo-width", 1.35);
        paint(map, id, "icon-opacity", 0);
      }
    }
  }
}

export function ExploreMap({
  markers,
  selectedId,
  onSelect,
  line,
  user,
  label,
  cluster = false,
  scrollZoom = false,
  numberedStops,
  showBoundary = false,
  onBoundsChange,
  resetNonce,
  fitAll = false,
}: {
  markers: AtlasMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  line: [number, number][] | null;
  user: { lat: number; lng: number } | null;
  label: string;
  cluster?: boolean;
  scrollZoom?: boolean;
  numberedStops?: string[];
  showBoundary?: boolean;
  onBoundsChange?: (bounds: MapBounds) => void;
  resetNonce?: number;
  fitAll?: boolean;
}) {
  const mapRef = useRef<MapRef>(null);
  const [styleFailed, setStyleFailed] = useState(false);
  const [zoom, setZoom] = useState<number>(CENTAR_VIEW.zoom);
  const [mapReady, setMapReady] = useState(false);
  const reduceRef = useRef(false);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const lastEmittedRef = useRef<MapBounds | null>(null);
  const markersRef = useRef(markers);
  onBoundsChangeRef.current = onBoundsChange;
  markersRef.current = markers;

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const style = styleFailed ? OSM_RASTER_STYLE : mapStyle();
  const attribution = styleFailed ? OSM_ATTRIBUTION : MAP_ATTRIBUTION;
  const clusterActive = cluster && zoom < 13.8;

  const points = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: markers.map((marker) => ({
        type: "Feature" as const,
        properties: { id: marker.id, label: marker.label },
        geometry: { type: "Point" as const, coordinates: [marker.lng, marker.lat] },
      })),
    }),
    [markers],
  );

  const route = useMemo(() => {
    if (!line || line.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: line.map(([lat, lng]) => [lng, lat]),
      },
    };
  }, [line]);

  const emitBounds = useCallback(() => {
    const map = mapRef.current;
    const notify = onBoundsChangeRef.current;
    if (!map || !notify) return;
    const bounds = map.getBounds();
    const next: MapBounds = {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      zoom: map.getZoom(),
    };
    const previous = lastEmittedRef.current;
    if (previous && sameBounds(previous, next)) return;
    lastEmittedRef.current = next;
    notify(next);
  }, []);

  const routeKey = lineSignature(line);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;
    const reduce = reduceRef.current;
    if (routeKey) {
      const pairs = routeKey.split(";").map((pair) => {
        const [lat, lng] = pair.split(",");
        return [Number(lat), Number(lng)] as const;
      });
      const lngs = pairs.map((pair) => pair[1]);
      const lats = pairs.map((pair) => pair[0]);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 52, maxZoom: 16.4, duration: reduce ? 0 : 700, ...folioCamera(reduce) },
      );
      return;
    }
    const selected = markersRef.current.find((marker) => marker.id === selectedId);
    if (!selected) return;
    const center = map.getCenter();
    const alreadyThere =
      Math.abs(center.lng - selected.lng) < 8e-5 &&
      Math.abs(center.lat - selected.lat) < 8e-5 &&
      map.getZoom() >= 16.05;
    if (alreadyThere) return;
    map.flyTo({
      center: [selected.lng, selected.lat],
      zoom: Math.max(map.getZoom(), 16.1),
      ...folioCamera(reduce),
      duration: reduce ? 0 : 600,
    });
  }, [mapReady, routeKey, selectedId]);

  useEffect(() => {
    if (resetNonce === undefined) return;
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(
      [
        [CENTAR_BBOX.west, CENTAR_BBOX.south],
        [CENTAR_BBOX.east, CENTAR_BBOX.north],
      ],
      { padding: 32, duration: reduceRef.current ? 0 : 600, ...folioCamera(reduceRef.current) },
    );
  }, [resetNonce]);

  useEffect(() => {
    if (!fitAll || !mapReady) return;
    const map = mapRef.current;
    const current = markersRef.current;
    if (!map || current.length === 0) return;
    const lngs = current.map((marker) => marker.lng);
    const lats = current.map((marker) => marker.lat);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 46, maxZoom: 15.2, duration: reduceRef.current ? 0 : 700, ...folioCamera(reduceRef.current) },
    );
  }, [fitAll, mapReady, markers]);

  const stopIndex = useMemo(() => {
    const map = new Map<string, number>();
    numberedStops?.forEach((slug, index) => map.set(slug, index + 1));
    return map;
  }, [numberedStops]);

  return (
    <div className="cs-map h-full w-full" role="region" aria-label={label}>
      <MapGL
        ref={mapRef}
        initialViewState={{ ...CENTAR_VIEW, pitch: 50, bearing: -18 }}
        minZoom={12}
        maxZoom={19}
        mapStyle={style}
        attributionControl={false}
        scrollZoom={scrollZoom}
        reuseMaps
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={clusterActive ? ["cs-clusters"] : undefined}
        onLoad={(event) => {
          event.target.on("styleimagemissing", (missing) => {
            if (event.target.hasImage(missing.id)) return;
            const data = new ImageData(1, 1);
            event.target.addImage(missing.id, data);
          });
          applyCentarCartography(event.target);
          if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            event.target.jumpTo({ pitch: 0, bearing: 0 });
          }
          event.target.resize();
          setMapReady(true);
          emitBounds();
        }}
        onMoveEnd={(event) => {
          const nextZoom = event.viewState.zoom;
          setZoom((current) => (Math.abs(current - nextZoom) < 0.04 ? current : nextZoom));
          emitBounds();
        }}
        onError={() => setStyleFailed(true)}
        onClick={(event) => {
          const feature = event.features?.[0];
          if (!feature || feature.layer.id !== "cs-clusters") return;
          const clusterId = feature.properties?.cluster_id;
          const source = mapRef.current?.getSource("cs-points");
          if (!source || clusterId === undefined || !("getClusterExpansionZoom" in source)) return;
          const geometry = feature.geometry;
          if (geometry.type !== "Point") return;
          const [lng, lat] = geometry.coordinates as [number, number];
          (
            source as unknown as {
              getClusterExpansionZoom: (id: number, cb: (err: Error | null, zoom: number) => void) => void;
            }
          ).getClusterExpansionZoom(Number(clusterId), (err, nextZoom) => {
            if (err) return;
            mapRef.current?.easeTo({ center: [lng, lat], zoom: nextZoom, duration: reduceRef.current ? 0 : 400 });
          });
        }}
      >
        <NavigationControl position="top-right" showCompass />
        <AttributionControl compact position="bottom-right" customAttribution={attribution} />
        <Source id="centar-mask" type="geojson" data={outsideMask}>
          <Layer
            id="centar-mask-fill"
            type="fill"
            paint={{ "fill-color": "#1a140f", "fill-opacity": 0.28 }}
          />
        </Source>
        <Source id="centar-boundary" type="geojson" data={boundaryData}>
          <Layer
            id="centar-fill"
            type="fill"
            paint={{ "fill-color": "#ff6b4a", "fill-opacity": showBoundary ? 0.05 : 0 }}
          />
          <Layer
            id="centar-outline-glow"
            type="line"
            paint={{ "line-color": "#f6efe4", "line-width": 5, "line-opacity": 0.7 }}
          />
          <Layer
            id="centar-outline"
            type="line"
            paint={{ "line-color": "#c45a32", "line-width": 2.2, "line-opacity": 0.95 }}
          />
        </Source>
        {route ? (
          <Source id="cs-route" type="geojson" data={route}>
            <Layer
              id="cs-route-casing"
              type="line"
              paint={{
                "line-color": "#faf6ef",
                "line-width": 6.5,
                "line-opacity": 0.9,
              }}
            />
            <Layer
              id="cs-route-line"
              type="line"
              paint={{
                "line-color": "#1736b5",
                "line-width": 3.6,
                "line-opacity": 0.96,
              }}
            />
          </Source>
        ) : null}
        {cluster ? (
          <Source id="cs-points" type="geojson" data={points} cluster clusterMaxZoom={13.5} clusterRadius={40}>
            <Layer
              id="cs-clusters"
              type="circle"
              filter={["has", "point_count"] as FilterSpecification}
              paint={{
                "circle-color": "#12100d",
                "circle-stroke-color": "#faf6ef",
                "circle-stroke-width": 2,
                "circle-radius": ["step", ["get", "point_count"], 17, 8, 21, 16, 26],
                "circle-opacity": 0.94,
              }}
            />
          </Source>
        ) : null}
        {(clusterActive ? markers.filter((marker) => marker.id === selectedId) : markers).map((marker) => {
          const number = stopIndex.get(marker.id);
          return (
            <Marker
              key={marker.id}
              longitude={marker.lng}
              latitude={marker.lat}
              anchor={number ? "center" : "bottom"}
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                onSelect(marker.id);
              }}
            >
              <button
                type="button"
                className={`${pinClass(marker.id === selectedId, marker.tone)}${number ? " is-stop" : " is-mark"}`}
                aria-label={marker.label}
                aria-pressed={marker.id === selectedId}
              >
                {number ? (
                  <span>{number}</span>
                ) : (
                  <svg viewBox="0 0 28 36" className="cs-pin-mark" aria-hidden="true">
                    <path d="M14 34.2C14 34.2 3 22.4 3 13.2A11 11 0 0 1 25 13.2C25 22.4 14 34.2 14 34.2Z" />
                    <circle cx="14" cy="13" r="4.2" />
                  </svg>
                )}
              </button>
            </Marker>
          );
        })}
        {user ? (
          <Marker longitude={user.lng} latitude={user.lat} anchor="center">
            <span className="cs-user-dot" aria-label="Current position" />
          </Marker>
        ) : null}
      </MapGL>
      <span className="cs-map-vignette" aria-hidden="true" />
    </div>
  );
}
