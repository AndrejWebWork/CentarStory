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
import type { FilterSpecification } from "maplibre-gl";
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
  tone: "site" | "kitchen" | "nearby";
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

function pinClass(active: boolean, tone: AtlasMarker["tone"]) {
  const extra = tone === "kitchen" ? " is-kitchen" : tone === "nearby" ? " is-nearby" : "";
  return `cs-pin${active ? " is-active" : ""}${extra}`;
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
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const style = styleFailed ? OSM_RASTER_STYLE : mapStyle();
  const attribution = styleFailed ? OSM_ATTRIBUTION : MAP_ATTRIBUTION;
  const clusterActive = cluster && zoom < 14.2;

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
    if (!map || !onBoundsChange) return;
    const bounds = map.getBounds();
    onBoundsChange({
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      zoom: map.getZoom(),
    });
  }, [onBoundsChange]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const reduce = reduceRef.current;
    if (line && line.length > 1) {
      const lngs = line.map((pair) => pair[1]);
      const lats = line.map((pair) => pair[0]);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 48, maxZoom: 16, duration: reduce ? 0 : 700 },
      );
      return;
    }
    const selected = markers.find((marker) => marker.id === selectedId);
    if (selected) {
      map.flyTo({
        center: [selected.lng, selected.lat],
        zoom: Math.max(map.getZoom(), 16),
        duration: reduce ? 0 : 550,
      });
    }
  }, [line, markers, selectedId]);

  useEffect(() => {
    if (resetNonce === undefined) return;
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(
      [
        [CENTAR_BBOX.west, CENTAR_BBOX.south],
        [CENTAR_BBOX.east, CENTAR_BBOX.north],
      ],
      { padding: 32, duration: reduceRef.current ? 0 : 600 },
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
          event.target.resize();
          emitBounds();
        }}
        onMoveEnd={(event) => {
          setZoom(event.viewState.zoom);
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
        <NavigationControl position="top-right" showCompass={false} />
        <AttributionControl compact position="bottom-right" customAttribution={attribution} />
        {showBoundary ? (
          <Source id="centar-boundary" type="geojson" data={boundaryData}>
            <Layer
              id="centar-fill"
              type="fill"
              paint={{ "fill-color": "#7a3b2a", "fill-opacity": 0.05 }}
            />
            <Layer
              id="centar-outline"
              type="line"
              paint={{
                "line-color": "#7a3b2a",
                "line-width": 1.4,
                "line-dasharray": [2, 1.4],
                "line-opacity": 0.7,
              }}
            />
          </Source>
        ) : null}
        {route ? (
          <Source id="cs-route" type="geojson" data={route}>
            <Layer
              id="cs-route-line"
              type="line"
              paint={{
                "line-color": "#7a3b2a",
                "line-width": 3.4,
                "line-opacity": 0.9,
              }}
            />
          </Source>
        ) : null}
        {cluster ? (
          <Source id="cs-points" type="geojson" data={points} cluster clusterMaxZoom={14} clusterRadius={44}>
            <Layer
              id="cs-clusters"
              type="circle"
              filter={["has", "point_count"] as FilterSpecification}
              paint={{
                "circle-color": "#7a3b2a",
                "circle-radius": ["step", ["get", "point_count"], 16, 8, 20, 16, 26],
                "circle-opacity": 0.92,
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
