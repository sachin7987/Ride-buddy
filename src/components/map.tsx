"use client";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { fetchDrivingRoute } from "@/lib/routing";
import {
  Loader2,
  Navigation,
  Route as RouteIcon,
  Clock,
  Maximize2,
  X,
} from "lucide-react";

const fixIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

const pinIcon = (color: string) =>
  L.divIcon({
    className: "ridebuddy-pin",
    html: `<div style="position:relative;width:28px;height:36px">
      <div style="position:absolute;left:50%;top:0;transform:translate(-50%,0);width:24px;height:24px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>
      <div style="position:absolute;left:50%;top:18px;transform:translate(-50%,0);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:14px solid ${color};filter:drop-shadow(0 2px 2px rgba(0,0,0,.2))"></div>
    </div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
  });

const driverIcon = L.divIcon({
  className: "ridebuddy-driver-pin",
  html: `<div style="position:relative;width:32px;height:32px">
    <div style="position:absolute;inset:0;border-radius:9999px;background:#0ea5e9;opacity:.25;animation:rb-ping 1.5s ease-out infinite"></div>
    <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:9999px;background:#0ea5e9;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>
  </div>
  <style>@keyframes rb-ping{0%{transform:scale(0.5);opacity:.6}100%{transform:scale(1.5);opacity:0}}</style>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [points, map]);
  return null;
}

/** Forces leaflet to recalc its size when the wrapper resizes (e.g. fullscreen). */
function InvalidateOnResize({ trigger }: { trigger: any }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

export type RouteMapProps = {
  from?: { lat: number; lng: number; label?: string } | null;
  to?: { lat: number; lng: number; label?: string } | null;
  driver?: { lat: number; lng: number } | null;
  /** Pre-computed polyline (skips OSRM fetch). */
  polyline?: [number, number][];
  /** Disable automatic route fetching. */
  disableRouting?: boolean;
  height?: number | string;
  className?: string;
};

export default function RouteMap({
  from,
  to,
  driver,
  polyline,
  disableRouting = false,
  height = 320,
  className,
}: RouteMapProps) {
  const [route, setRoute] = useState<{
    line: [number, number][];
    distance: number;
    duration: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fixIcons();
  }, []);

  // Lock body scroll + close on Escape while fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  // Fetch real driving route via OSRM
  useEffect(() => {
    if (disableRouting || polyline?.length || !from || !to) return;
    const ctrl = new AbortController();
    setLoading(true);
    fetchDrivingRoute(from, to, ctrl.signal)
      .then((r) => {
        if (r) setRoute({ line: r.polyline, distance: r.distance, duration: r.duration });
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [from?.lat, from?.lng, to?.lat, to?.lng, disableRouting, polyline]);

  const points: [number, number][] = [];
  if (from) points.push([from.lat, from.lng]);
  if (to) points.push([to.lat, to.lng]);
  if (driver) points.push([driver.lat, driver.lng]);

  const center: [number, number] = points[0] || [22.9734, 78.6569];

  // Priority: explicit polyline prop > fetched OSRM route > straight line fallback
  const explicitLine = polyline ?? null;
  const realRoute = route?.line ?? null;
  const fallbackLine =
    from && to ? ([[from.lat, from.lng], [to.lat, to.lng]] as [number, number][]) : null;
  const renderedLine = explicitLine ?? realRoute ?? fallbackLine;
  const isRealRoute = !!(explicitLine || realRoute);

  const wrapperClass = fullscreen
    ? "fixed inset-0 z-[9999] bg-background animate-fade-in"
    : `relative ${className ?? ""}`;
  const wrapperStyle = fullscreen
    ? undefined
    : { height, width: "100%" as const };
  const mapRadius = fullscreen ? "0" : "0.75rem";

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", borderRadius: mapRadius }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {from && (
          <Marker position={[from.lat, from.lng]} icon={pinIcon("#16a97a")} />
        )}
        {to && <Marker position={[to.lat, to.lng]} icon={pinIcon("#ef4444")} />}
        {driver && <Marker position={[driver.lat, driver.lng]} icon={driverIcon} />}
        {renderedLine && renderedLine.length >= 2 && (
          <>
            <Polyline
              positions={renderedLine}
              pathOptions={{
                color: "#0a4736",
                weight: isRealRoute ? 7 : 5,
                opacity: 0.18,
              }}
            />
            <Polyline
              positions={renderedLine}
              pathOptions={{
                color: "#16a97a",
                weight: isRealRoute ? 4 : 3,
                opacity: 0.95,
                dashArray: isRealRoute ? undefined : "8 6",
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
        <FitBounds points={points} />
        <InvalidateOnResize trigger={fullscreen} />
      </MapContainer>

      {/* Route info chip */}
      {(loading || route) && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-sm shadow-md ring-1 ring-black/5 px-3 py-1.5 text-xs font-medium">
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
              <span>Calculating best route…</span>
            </>
          ) : (
            route && (
              <>
                <RouteIcon className="h-3.5 w-3.5 text-brand-600" />
                <span>{Math.round(route.distance / 1000)} km</span>
                <span className="text-muted-foreground">·</span>
                <Clock className="h-3.5 w-3.5 text-brand-600" />
                <span>{formatDuration(route.duration)}</span>
                <span className="ml-1 text-[10px] text-muted-foreground">
                  via roads
                </span>
              </>
            )
          )}
        </div>
      )}

      {!loading && !route && from && to && !explicitLine && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 rounded-full bg-amber-50 ring-1 ring-amber-200 px-2.5 py-1 text-[11px] text-amber-800">
          <Navigation className="h-3 w-3" />
          Approximate path
        </div>
      )}

      {/* Fullscreen toggle */}
      <button
        type="button"
        onClick={() => setFullscreen((v) => !v)}
        aria-label={fullscreen ? "Exit fullscreen" : "Open map fullscreen"}
        title={fullscreen ? "Exit fullscreen (Esc)" : "Open fullscreen"}
        className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md ring-1 ring-black/5 px-3 py-1.5 text-xs font-medium hover:bg-white hover:shadow-lg active:scale-95 transition-all"
      >
        {fullscreen ? (
          <>
            <X className="h-3.5 w-3.5 text-foreground" />
            <span className="hidden sm:inline">Close</span>
          </>
        ) : (
          <>
            <Maximize2 className="h-3.5 w-3.5 text-foreground" />
            <span className="hidden sm:inline">Fullscreen</span>
          </>
        )}
      </button>

      {fullscreen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-white/95 backdrop-blur-sm shadow-md ring-1 ring-black/5 px-3 py-1 text-[11px] text-muted-foreground">
          Press <kbd className="font-mono px-1 rounded border bg-background">Esc</kbd> to exit fullscreen
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
