import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Send, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="container py-10 md:py-12 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M5 17h14l-1.5-6.5A3 3 0 0 0 14.6 8H9.4a3 3 0 0 0-2.9 2.5L5 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="8" cy="17" r="2" fill="currentColor" />
                <circle cx="16" cy="17" r="2" fill="currentColor" />
              </svg>
            </span>
            <span>
              Ride<span className="text-brand-600">Buddy</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Verified carpooling for India. Share rides, save money, reduce traffic
            and CO₂.
          </p>
          <div className="mt-4 flex gap-3 text-muted-foreground">
            <Link href="#" aria-label="Website" className="hover:text-foreground">
              <Globe className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Newsletter" className="hover:text-foreground">
              <Send className="h-4 w-4" />
            </Link>
            <Link href="#" aria-label="Made with love" className="hover:text-foreground">
              <Heart className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/search" className="hover:text-foreground">Search rides</Link></li>
            <li><Link href="/publish" className="hover:text-foreground">Publish a ride</Link></li>
            <li><Link href="/kyc" className="hover:text-foreground">Verification</Link></li>
            <li><Link href="/bookings" className="hover:text-foreground">My bookings</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/how-it-works" className="hover:text-foreground">How it works</Link></li>
            <li><Link href="/safety" className="hover:text-foreground">Safety</Link></li>
            <li><Link href="/help" className="hover:text-foreground">Help</Link></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h4 className="font-semibold text-sm mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a href="mailto:hello@ridebuddy.in" className="hover:text-foreground break-all">
                hello@ridebuddy.in
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a href="tel:+918001433669" className="hover:text-foreground">
                +91 1800-RIDE-NOW
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" /> Bengaluru, India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container py-4 flex flex-col-reverse items-center gap-3 text-center md:flex-row md:justify-between md:gap-2 md:text-left text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RideBuddy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
