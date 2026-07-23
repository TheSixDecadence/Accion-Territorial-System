"use client";

import MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Minus, Plus } from "lucide-react";

const MAP_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const MAP_POSITION_CLASSES = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
};

const GEOJSON_COLORS = {
  dark: { fill: "#404040", line: "#171717" },
  light: { fill: "#d4d4d4", line: "#ffffff" },
};

const MapContext = createContext(null);

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useMap() {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }

  return context;
}

function MapLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-xs">
      <div className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

const Map = forwardRef(function Map(
  {
    children,
    className,
    theme = "light",
    style,
    loading = false,
    ...mapOptions
  },
  ref,
) {
  const containerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useImperativeHandle(ref, () => mapInstance, [mapInstance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: style ?? MAP_STYLES[theme],
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...mapOptions,
    });

    const handleLoad = () => setIsLoaded(true);

    map.on("load", handleLoad);
    setMapInstance(map);

    return () => {
      map.off("load", handleLoad);
      map.remove();
      setMapInstance(null);
      setIsLoaded(false);
    };
    // MapLibre options are initialization-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded,
      theme,
    }),
    [mapInstance, isLoaded, theme],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={joinClasses("relative h-full w-full", className)}
      >
        {(!isLoaded || loading) && <MapLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

function ControlButton({ children, label, onClick }) {
  return (
    <button
      aria-label={label}
      className="flex size-8 items-center justify-center transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function MapControls({ position = "top-right", className }) {
  const { map } = useMap();

  return (
    <div
      className={joinClasses(
        "absolute z-10 overflow-hidden rounded-md border border-border bg-background shadow-sm",
        MAP_POSITION_CLASSES[position],
        className,
      )}
    >
      <ControlButton
        label="Acercar"
        onClick={() => map?.zoomTo(map.getZoom() + 1, { duration: 300 })}
      >
        <Plus className="size-4" />
      </ControlButton>
      <div className="border-t border-border">
        <ControlButton
          label="Alejar"
          onClick={() => map?.zoomTo(map.getZoom() - 1, { duration: 300 })}
        >
          <Minus className="size-4" />
        </ControlButton>
      </div>
    </div>
  );
}

function MapMarker({ latitude, longitude, onClick }) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const marker = new MapLibreGL.Marker({ color: "#2e3180" })
      .setLngLat([longitude, latitude])
      .addTo(map);
    const element = marker.getElement();

    if (onClick) {
      element.style.cursor = "pointer";
      element.addEventListener("click", onClick);
    }

    return () => {
      if (onClick) element.removeEventListener("click", onClick);
      marker.remove();
    };
  }, [latitude, longitude, map, onClick]);

  return null;
}

function MapGeoJSON({
  data,
  id: providedId,
  fill = true,
  fillPaint,
  linePaint,
  beforeId,
}) {
  const { map, isLoaded, theme } = useMap();
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const sourceId = `geojson-source-${id}`;
  const fillLayerId = `geojson-fill-${id}`;
  const lineLayerId = `geojson-line-${id}`;

  const colors = GEOJSON_COLORS[theme];
  const resolvedFillPaint = useMemo(
    () => ({
      "fill-color": colors.fill,
      ...fillPaint,
    }),
    [colors.fill, fillPaint],
  );
  const resolvedLinePaint = useMemo(
    () => ({
      "line-color": colors.line,
      "line-width": 0.5,
      ...linePaint,
    }),
    [colors.line, linePaint],
  );

  useEffect(() => {
    if (!map || !isLoaded) return;

    map.addSource(sourceId, {
      type: "geojson",
      data,
    });
    if (fill) {
      map.addLayer(
        {
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: resolvedFillPaint,
        },
        beforeId,
      );
    }
    map.addLayer(
      {
        id: lineLayerId,
        type: "line",
        source: sourceId,
        paint: resolvedLinePaint,
      },
      beforeId,
    );

    return () => {
      if (!map.style) return;

      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
    // Layers are recreated only if the map instance or load state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    map.getSource(sourceId)?.setData(data);
  }, [map, isLoaded, sourceId, data]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    if (map.getLayer(fillLayerId)) {
      Object.entries(resolvedFillPaint).forEach(([property, value]) => {
        map.setPaintProperty(fillLayerId, property, value);
      });
    }
    Object.entries(resolvedLinePaint).forEach(([property, value]) => {
      map.setPaintProperty(lineLayerId, property, value);
    });
  }, [
    map,
    isLoaded,
    fillLayerId,
    fill,
    lineLayerId,
    resolvedFillPaint,
    resolvedLinePaint,
  ]);

  return null;
}

export { Map, MapControls, MapGeoJSON, MapMarker };
