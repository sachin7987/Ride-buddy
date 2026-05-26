import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { ConditionalFooter } from "@/components/layout/conditional-footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "RideBuddy — Share rides across India",
  description:
    "Carpool with verified drivers and passengers. Save money, reduce traffic, make new friends. Bikes, cars and more — RideBuddy connects people travelling the same way.",
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  applicationName: "RideBuddy",
  appleWebApp: {
    capable: true,
    title: "RideBuddy",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

// Ensure proper rendering on mobile (no zoom-on-focus, accurate viewport).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#16a97a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans h-screen [height:100dvh] overflow-hidden flex flex-col bg-background`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 overflow-y-auto app-scroll">
            <div className="min-h-full flex flex-col">
              <div className="flex-1">{children}</div>
              <ConditionalFooter />
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
