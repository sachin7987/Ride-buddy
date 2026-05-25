"use client";
import dynamic from "next/dynamic";
import { type RouteMapProps } from "./map";

const RouteMap = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl bg-muted animate-pulse flex items-center justify-center text-sm text-muted-foreground"
      style={{ height: 320 }}
    >
      Loading map…
    </div>
  ),
});

export function Map(props: RouteMapProps) {
  return <RouteMap {...props} />;
}
