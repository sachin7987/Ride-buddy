"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { isDriver, isPassenger } from "@/lib/roles";

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  // Default (logged-out) shows everything; once logged in we filter by role.
  const role = (session?.user as any)?.role as string | undefined;
  const showDriver = !session?.user || isDriver(role);
  const showPassenger = !session?.user || isPassenger(role);

  const navItems = [
    showPassenger && { href: "/search", label: "Search rides", icon: Search },
    showDriver && { href: "/publish", label: "Publish ride", icon: PlusCircle },
  ].filter(Boolean) as { href: string; label: string; icon: any }[];

  return (
    <header className="shrink-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
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

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent transition-colors"
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
          ) : session?.user ? (
            <div className="hidden md:flex items-center gap-2 relative">
              <Link
                href="/bookings"
                className="px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent"
              >
                My trips
              </Link>
              {session.user.kycStatus !== "VERIFIED" && (
                <Link
                  href="/kyc"
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Verify
                </Link>
              )}
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-2 rounded-full hover:bg-accent p-1 pr-3 transition-colors"
              >
                <Avatar
                  src={session.user.image}
                  name={session.user.name}
                  size={32}
                />
                <span className="text-sm font-medium">
                  {session.user.name.split(" ")[0]}
                </span>
              </button>
              {menu && (
                <div
                  className="absolute right-0 top-12 w-56 rounded-xl border bg-card shadow-xl py-1 animate-fade-in"
                  onMouseLeave={() => setMenu(false)}
                >
                  <DropItem href="/profile" label="My profile" />
                  {showDriver && (
                    <DropItem href="/vehicles" label="My vehicles" />
                  )}
                  <DropItem
                    href="/bookings"
                    label={showDriver ? "My trips" : "My bookings"}
                  />
                  <DropItem href="/kyc" label="KYC verification" />
                  <DropItem
                    href="/account/mode"
                    label={
                      role === "PASSENGER"
                        ? "Become a driver"
                        : "Switch mode"
                    }
                    icon={Repeat}
                  />
                  {session.user.isAdmin && (
                    <DropItem href="/admin" label="Admin panel" />
                  )}
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="gradient" size="sm">
                  Get started
                </Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t bg-background overflow-hidden transition-all",
          open ? "max-h-[420px] py-2" : "max-h-0"
        )}
      >
        <nav className="container flex flex-col gap-1 py-2">
          {navItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent"
            >
              <it.icon className="h-4 w-4 text-muted-foreground" />
              {it.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link
                href="/bookings"
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg hover:bg-accent"
              >
                {showDriver ? "My trips" : "My bookings"}
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg hover:bg-accent"
              >
                Profile
              </Link>
              {showDriver && (
                <Link
                  href="/vehicles"
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg hover:bg-accent"
                >
                  Vehicles
                </Link>
              )}
              <Link
                href="/kyc"
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg hover:bg-accent"
              >
                KYC verification
              </Link>
              <Link
                href="/account/mode"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-accent"
              >
                <Repeat className="h-4 w-4 text-muted-foreground" />
                {role === "PASSENGER" ? "Become a driver" : "Switch mode"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-left px-3 py-3 rounded-lg hover:bg-accent text-destructive"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/signin" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="gradient" className="w-full">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function DropItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon?: any;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
    >
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      {label}
    </Link>
  );
}
