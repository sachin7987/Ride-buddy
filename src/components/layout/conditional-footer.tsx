"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "./footer";

// Marketing/landing routes show the full footer.
const MARKETING_ROUTES = ["/"];

// Routes that show no footer at all (focused flows like checkout/auth).
const NO_FOOTER_PREFIXES = [
  "/auth",
  "/bookings/", // booking detail + checkout — keep distraction-free
  "/rides/", // ride detail + tracker
  "/admin",
];

export function ConditionalFooter() {
  const pathname = usePathname();

  if (MARKETING_ROUTES.includes(pathname)) {
    return <Footer />;
  }

  if (NO_FOOTER_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  // Slim app-style footer for dashboard pages (search, bookings list, profile, vehicles, kyc).
  return (
    <footer className="border-t mt-auto">
      <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} RideBuddy</p>
        <nav className="flex gap-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <Link href="#" className="hover:text-foreground">Help</Link>
          <Link href="#" className="hover:text-foreground">Terms</Link>
          <Link href="#" className="hover:text-foreground">Privacy</Link>
        </nav>
      </div>
    </footer>
  );
}
