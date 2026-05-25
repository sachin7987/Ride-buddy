"use client";
import { useEffect, useState } from "react";
import { Map } from "@/components/map-loader";
import { Button } from "@/components/ui/button";
import { Locate, MapPin } from "lucide-react";
import { toast } from "sonner";

export function LiveMap({
  rideId,
  from,
  to,
  amDriver,
}: {
  rideId: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  amDriver: boolean;
}) {
  const [driver, setDriver] = useState<{ lat: number; lng: number } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // poll location every 10s
  useEffect(() => {
    let mounted = true;
    async function pull() {
      try {
        const res = await fetch(`/api/location?rideId=${rideId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.driver) {
          setDriver({ lat: data.driver.lat, lng: data.driver.lng });
        }
      } catch {}
    }
    pull();
    const t = setInterval(pull, 10000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [rideId]);

  // driver-only: share location continuously
  useEffect(() => {
    if (!amDriver || !sharing) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this browser");
      return;
    }
    let lastSent = 0;
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - lastSent < 8000) return;
        lastSent = now;
        const body = {
          rideId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading ?? null,
          speed: pos.coords.speed ?? null,
        };
        setDriver({ lat: body.lat, lng: body.lng });
        try {
          await fetch("/api/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        } catch {}
      },
      (err) => {
        setError(err.message);
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [amDriver, sharing, rideId]);

  return (
    <div>
      <Map
        from={{ ...from, label: "Pickup" }}
        to={{ ...to, label: "Drop" }}
        driver={driver}
        height={300}
      />
      {amDriver && (
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant={sharing ? "outline" : "gradient"}
            onClick={() => {
              if (!sharing) {
                if (!("geolocation" in navigator)) {
                  return toast.error("Your browser can't share location");
                }
                navigator.geolocation.getCurrentPosition(
                  () => {
                    setSharing(true);
                    toast.success("Sharing your location with passengers");
                  },
                  () => toast.error("Please allow location access")
                );
              } else {
                setSharing(false);
                toast.message("Location sharing stopped");
              }
            }}
          >
            <Locate className="h-4 w-4" />
            {sharing ? "Stop sharing" : "Share my live location"}
          </Button>
          {sharing && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Broadcasting…
            </span>
          )}
        </div>
      )}
      {!amDriver && !driver && (
        <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          Driver hasn't started sharing location yet.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
