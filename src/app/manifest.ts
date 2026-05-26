import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RideBuddy — Carpool India",
    short_name: "RideBuddy",
    description:
      "Share rides across India. Verified drivers and passengers, real-time tracking, in-app payments.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#16a97a",
    categories: ["travel", "navigation", "lifestyle"],
    lang: "en-IN",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Search rides",
        short_name: "Search",
        url: "/search",
        description: "Find a ride going your way",
      },
      {
        name: "My trips",
        short_name: "Trips",
        url: "/bookings",
        description: "View your upcoming and past rides",
      },
      {
        name: "Publish a ride",
        short_name: "Publish",
        url: "/publish",
        description: "Offer a ride and earn",
      },
    ],
  };
}
