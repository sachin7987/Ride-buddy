"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import { RideStatusPill } from "@/components/ride/lifecycle-actions";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  Users,
  Navigation,
} from "lucide-react";

export type PassengerTrip = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  fromCity: string;
  toCity: string;
  seats: number;
  driverName: string;
  bookingStatus: string;
  rideStatus: string;
  amountLabel: string;
};

export type DriverTrip = {
  id: string;
  dateLabel: string;
  timeLabel: string;
  fromCity: string;
  toCity: string;
  seatsBooked: number;
  totalSeats: number;
  vehicleLabel: string;
  rideStatus: string;
  confirmed: { id: string; passengerName: string; seats: number }[];
  trackHref: string | null;
  trackLabel: string | null;
};

type Mode = "passenger" | "driver";

export function TripsView({
  canDrive,
  passengerTrips,
  driverTrips,
  initialMode,
}: {
  canDrive: boolean;
  passengerTrips: PassengerTrip[];
  driverTrips: DriverTrip[];
  initialMode: Mode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>(
    canDrive ? initialMode : "passenger"
  );

  function switchMode(next: Mode) {
    // Update local state for an instant tab switch...
    setMode(next);
    // ...and persist the choice into the route via Next's router (not raw
    // history.replaceState) so it becomes part of the cached route entry.
    // This way, navigating into a ride and clicking "Back" restores
    // /bookings?mode=driver with the driver tab still selected, while the
    // navbar's plain "/bookings" link still defaults to the passenger tab.
    router.replace(`${pathname}?mode=${next}`, { scroll: false });
  }

  return (
    <div className="mt-5">
      {canDrive && (
        <div
          role="tablist"
          aria-label="Trip type"
          className="inline-flex w-full sm:w-auto rounded-xl border bg-muted/40 p-1"
        >
          <ModeTab
            active={mode === "passenger"}
            onClick={() => switchMode("passenger")}
            icon={User}
            label="As a passenger"
            count={passengerTrips.length}
          />
          <ModeTab
            active={mode === "driver"}
            onClick={() => switchMode("driver")}
            icon={Car}
            label="As a driver"
            count={driverTrips.length}
          />
        </div>
      )}

      <div className="mt-5">
        {mode === "passenger" ? (
          <PassengerList trips={passengerTrips} />
        ) : (
          <DriverList trips={driverTrips} />
        )}
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count: number;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        "flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {label}
      <span
        className={[
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
          active
            ? "bg-brand-100 text-brand-700"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function PassengerList({ trips }: { trips: PassengerTrip[] }) {
  if (trips.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No trips yet"
        description="When you book a ride, it'll show up here so you can track and manage it."
        action={
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Find a ride
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((t) => (
        <Link key={t.id} href={`/bookings/${t.id}`} className="block">
          <Card className="hover:shadow-md hover:border-brand-300 transition-all">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <RouteHeadline from={t.fromCity} to={t.toCity} />
                  <DateTimeRow date={t.dateLabel} time={t.timeLabel} />
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    {t.seats} seat{t.seats > 1 ? "s" : ""} · with {t.driverName}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <BookingStatus status={t.bookingStatus} />
                  <RideStatusPill status={t.rideStatus} />
                  <div className="text-sm font-bold pt-0.5">
                    {t.amountLabel}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function DriverList({ trips }: { trips: DriverTrip[] }) {
  if (trips.length === 0) {
    return (
      <EmptyState
        icon={Car}
        title="No published rides yet"
        description="Publish a ride to offer empty seats to passengers heading your way."
        action={
          <Link
            href="/publish"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <Car className="h-4 w-4" />
            Publish a ride
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <RouteHeadline from={r.fromCity} to={r.toCity} />
                <DateTimeRow date={r.dateLabel} time={r.timeLabel} />
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {r.seatsBooked}/{r.totalSeats} seats booked
                  </span>
                  {r.vehicleLabel && (
                    <span className="flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5" />
                      {r.vehicleLabel}
                    </span>
                  )}
                </div>
              </div>
              <RideStatusPill status={r.rideStatus} />
            </div>

            {r.confirmed.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Passengers
                </p>
                <div className="flex flex-wrap gap-2">
                  {r.confirmed.map((b) => (
                    <Link
                      key={b.id}
                      href={`/bookings/${b.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs hover:bg-accent transition-colors"
                    >
                      <User className="h-3 w-3" />
                      {b.passengerName} · {b.seats} seat
                      {b.seats > 1 ? "s" : ""}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={`/rides/${r.id}`}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              >
                View ride
              </Link>
              <Link
                href={`/rides/${r.id}/bookings`}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
              >
                Manage bookings
              </Link>
              {r.trackHref && (
                <Link
                  href={r.trackHref}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  {r.trackLabel}
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RouteHeadline({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold">
      <span className="truncate">{from}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{to}</span>
    </div>
  );
}

function DateTimeRow({ date, time }: { date: string; time: string }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5" />
        {date}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {time}
      </span>
    </div>
  );
}

function BookingStatus({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: "warning", label: "Pending payment" },
    CONFIRMED: { variant: "success", label: "Confirmed" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    COMPLETED: { variant: "muted", label: "Completed" },
    REFUNDED: { variant: "muted", label: "Refunded" },
  };
  const m = map[status] ?? map.PENDING;
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
