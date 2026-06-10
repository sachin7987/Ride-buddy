"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Search,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Repeat,
  User,
  Car,
  MapPin,
  ChevronDown,
  LogIn,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { isDriver, isPassenger } from "@/lib/roles";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default (logged-out) shows everything; once logged in we filter by role.
  const role = (session?.user as any)?.role as string | undefined;
  const showDriver = !session?.user || isDriver(role);
  const showPassenger = !session?.user || isPassenger(role);

  // Close the dropdown when the user clicks anywhere outside it. Avoids the
  // earlier `onMouseLeave`-only behaviour that broke on touch devices and
  // closed too eagerly when crossing the gap between avatar and menu.
  useEffect(() => {
    if (!menu) return;
    function onPointer(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenu(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenu(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menu]);

  // A single, cohesive primary-nav group rendered next to the logo. "My trips"
  // lives here too (not bolted onto the account cluster) so all the main
  // destinations read as one consistent set.
  const navItems = [
    showPassenger && { href: "/search", label: "Search rides", icon: Search },
    showDriver && { href: "/publish", label: "Publish ride", icon: PlusCircle },
    session?.user && {
      href: "/bookings",
      label: "My trips",
      icon: MapPin,
    },
  ].filter(Boolean) as { href: string; label: string; icon: any }[];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="shrink-0 z-40 w-full border-b bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg shrink-0"
        >
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

        {/* Primary nav — one consistent group, left-aligned next to the logo */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navItems.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent"
                )}
              >
                <it.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    active
                      ? "text-brand-600"
                      : "text-muted-foreground group-hover:text-brand-600"
                  )}
                />
                {it.label}
              </Link>
            );
          })}
        </nav>

        {/* Account cluster — always pinned to the far right */}
        <div className="ml-auto flex items-center gap-2">
          {status === "loading" ? (
            <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
          ) : session?.user ? (
            <div className="hidden md:flex items-center gap-2 relative" ref={dropdownRef}>
              {session.user.kycStatus !== "VERIFIED" && (
                <Link
                  href="/kyc"
                  className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Verify
                </Link>
              )}
              <button
                onClick={() => setMenu((m) => !m)}
                aria-haspopup="menu"
                aria-expanded={menu}
                className={cn(
                  "flex items-center gap-2 rounded-full hover:bg-accent p-1 pr-2 transition-colors",
                  menu && "bg-accent"
                )}
              >
                <Avatar
                  src={session.user.image}
                  name={session.user.name}
                  size={32}
                />
                <span className="text-sm font-medium">
                  {session.user.name.split(" ")[0]}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    menu && "rotate-180"
                  )}
                />
              </button>
              {menu && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-64 rounded-xl border bg-card shadow-xl py-2 animate-fade-in"
                >
                  {/* Header showing the active account so the user knows
                      which session the menu actions will affect. */}
                  <div className="px-3 pb-2 mb-1 border-b">
                    <p className="text-sm font-semibold leading-tight truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>

                  <DropItem href="/profile" label="My profile" icon={User} />
                  {showDriver && (
                    <DropItem
                      href="/vehicles"
                      label="My vehicles"
                      icon={Car}
                    />
                  )}
                  <DropItem
                    href="/bookings"
                    label={showDriver ? "My trips" : "My bookings"}
                    icon={MapPin}
                  />

                  <div className="my-1 h-px bg-border" />

                  <DropItem
                    href="/kyc"
                    label="KYC verification"
                    icon={ShieldCheck}
                  />
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
                    <>
                      <div className="my-1 h-px bg-border" />
                      <DropItem
                        href="/admin"
                        label="Admin panel"
                        icon={ShieldAlert}
                      />
                    </>
                  )}

                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="gradient" size="sm">
                  <UserPlus className="h-4 w-4" />
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
          open ? "max-h-[520px] py-2" : "max-h-0"
        )}
      >
        <nav className="container flex flex-col gap-1 py-2">
          {navItems.map((it) => (
            <MobileItem
              key={it.href}
              href={it.href}
              icon={it.icon}
              label={it.label}
              onClick={() => setOpen(false)}
            />
          ))}
          {session?.user ? (
            <>
              <div className="my-1 h-px bg-border" />
              <MobileItem
                href="/profile"
                icon={User}
                label="My profile"
                onClick={() => setOpen(false)}
              />
              {showDriver && (
                <MobileItem
                  href="/vehicles"
                  icon={Car}
                  label="My vehicles"
                  onClick={() => setOpen(false)}
                />
              )}
              <MobileItem
                href="/kyc"
                icon={ShieldCheck}
                label="KYC verification"
                onClick={() => setOpen(false)}
              />
              <MobileItem
                href="/account/mode"
                icon={Repeat}
                label={
                  role === "PASSENGER" ? "Become a driver" : "Switch mode"
                }
                onClick={() => setOpen(false)}
              />
              {session.user.isAdmin && (
                <MobileItem
                  href="/admin"
                  icon={ShieldAlert}
                  label="Admin panel"
                  onClick={() => setOpen(false)}
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 text-left px-3 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/auth/signin" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
              <Link href="/auth/signup" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="gradient" className="w-full">
                  <UserPlus className="h-4 w-4" />
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
  icon: any;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/85 hover:bg-accent hover:text-foreground transition-colors"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  );
}

function MobileItem({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
