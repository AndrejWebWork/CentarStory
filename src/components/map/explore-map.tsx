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

function applyCentarCartography(map: MapLibreMap) {
  try {
    const layers = map.getStyle()?.layers ?? [];
    for (const layer of layers) {
      const id = layer.id.toLowerCase();
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", "#f1ebe0");
      } else if (layer.type === "fill") {
        if (id.includes("water")) {
          map.setPaintProperty(layer.id, "fill-color", "#b8cad8");
        } else if (id.includes("park") || id.includes("grass") || id.includes("wood") || id.includes("green")) {
          map.setPaintProperty(layer.id, "fill-color", "#d5ddcf");
        } else if (id.includes("building")) {
          map.setPaintProperty(layer.id, "fill-color", "#ded4c3");
        }
      } else if (layer.type === "fill-extrusion" && id.includes("building")) {
        map.setPaintProperty(layer.id, "fill-extrusion-color", "#d8cebc");
        map.setPaintProperty(layer.id, "fill-extrusion-opacity", 0.55);
      } else if (layer.type === "line" && (id.includes("road") || id.includes("street") || id.includes("highway") || id.includes("bridge"))) {
        if (id.includes("casing")) {
          map.setPaintProperty(layer.id, "line-color", "#cfc4b1");
        } else {
          map.setPaintProperty(layer.id, "line-color", "#faf6ef");
        }
      } else if (layer.type === "symbol") {
        if (id.includes("poi")) {
          map.setLayoutProperty(layer.id, "visibility", "none");
        } else {
          map.setPaintProperty(layer.id, "text-color", "#2b251e");
          map.setPaintProperty(layer.id, "text-halo-color", "#f1ebe0");
          map.setPaintProperty(layer.id, "text-halo-width", 1.4);
        }
      }
    }
  } catch {
    /* Vector layer names vary across styles; ignore unsupported property overrides. */
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
        { padding: 52, maxZoom: 16.4, duration: reduce ? 0 : 700 },
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
      pitch: reduce ? 0 : 28,
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
      { padding: 32, pitch: 0, bearing: 0, duration: reduceRef.current ? 0 : 600 },
    );
  }, [resetNonce]);

  const stopIndex = useMemo(() => {
    const map = new Map<string, number>();
    numberedStops?.forEach((slug, index) => map.set(slug, index + 1));
    return map;
  }, [numberedStops]);

  return (
    <div className="cs-map h-full w-full" role="region" aria-label={label}>
      <MapGL
        ref={mapRef}
        initialViewState={CENTAR_VIEW}
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
        {showBoundary ? (
          <Source id="centar-boundary" type="geojson" data={boundaryData}>
            <Layer
              id="centar-fill"
              type="fill"
              paint={{ "fill-color": "#1736b5", "fill-opacity": 0.035 }}
            />
            <Layer
              id="centar-outline"
              type="line"
              paint={{
                "line-color": "#12100d",
                "line-width": 1.6,
                "line-dasharray": [2.2, 1.4],
                "line-opacity": 0.78,
              }}
            />
          </Source>
        ) : null}
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
              anchor="center"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                onSelect(marker.id);
              }}
            >
              <button
                type="button"
                className={`${pinClass(marker.id === selectedId, marker.tone)}${number ? " is-stop" : ""}`}
                aria-label={marker.label}
                aria-pressed={marker.id === selectedId}
              >
                <span>{number ?? ""}</span>
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
    </div>
  );
}
