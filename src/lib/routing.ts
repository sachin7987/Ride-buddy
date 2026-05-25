// Lightweight routing client using the public OSRM demo server.
// No API key required. For production you'd self-host OSRM or use ORS/Mapbox.

export type Route = {
  /** Decoded line coordinates as [lat, lng] pairs (Leaflet order). */
  polyline: [number, number][];
  /** Distance in metres. */
  distance: number;
  /** Duration in seconds. */
  duration: number;
};

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

export async function fetchDrivingRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  signal?: AbortSignal
): Promise<Route | null> {
  const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      code: string;
      routes?: Array<{
        geometry: { coordinates: [number, number][] };
        distance: number;
        duration: number;
      }>;
    };
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const r = data.routes[0];
    return {
      // OSRM returns [lng, lat] — Leaflet wants [lat, lng]
      polyline: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distance: r.distance,
      duration: r.duration,
    };
  } catch {
    return null;
  }
}
