import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, userIsDriver, userIsPassenger } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import { RideStatusPill } from "@/components/ride/lifecycle-actions";
import { formatINR, formatDate, formatTime } from "@/lib/utils";
import { ArrowRight, Calendar, MapPin, Car } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const user = await requireUser();
  const showDriver = userIsDriver(user);
  const showPassenger = userIsPassenger(user);

  const [bookings, drivenRides] = await Promise.all([
    showPassenger
      ? prisma.booking.findMany({
          where: { passengerId: user.id },
          include: {
            ride: {
              include: {
                driver: { select: { id: true, name: true, avatarUrl: true } },
                vehicle: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    showDriver
      ? prisma.ride.findMany({
          where: { driverId: user.id },
          include: {
            bookings: {
              include: {
                passenger: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
            vehicle: true,
          },
          orderBy: { departureTime: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold">
        {showDriver && showPassenger
          ? "My trips"
          : showDriver
          ? "My published rides"
          : "My bookings"}
      </h1>

      {showPassenger && (
      <section className="mt-5">
        {showDriver && (
          <h2 className="text-base font-semibold mb-2 text-muted-foreground">
            As a passenger
          </h2>
        )}
        {bookings.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No bookings yet"
            description="Find a ride and your bookings will appear here."
            action={
              <Link href="/search" className="text-brand-600 underline text-sm">
                Search rides
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`}>
                <Card className="hover:shadow-md hover:border-brand-300 transition-all">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(b.ride.departureTime)} ·{" "}
                          {formatTime(b.ride.departureTime)}
                        </div>
                        <div className="mt-1 text-lg font-semibold flex items-center gap-2">
                          {b.ride.fromCity}
                          <ArrowRight className="h-4 w-4" />
                          {b.ride.toCity}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {b.seats} seat{b.seats > 1 ? "s" : ""} · with{" "}
                          {b.ride.driver.name}
                        </div>
                      </div>
                      <div className="text-right space-y-1.5">
                        <BookingStatus status={b.status} />
                        <div>
                          <RideStatusPill status={b.ride.status} />
                        </div>
                        <div className="text-sm font-semibold pt-0.5">
                          {formatINR(b.totalAmount)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
      )}

      {showDriver && (
      <section className="mt-6">
        {showPassenger && (
          <h2 className="text-base font-semibold mb-2 text-muted-foreground">
            As a driver
          </h2>
        )}
        {drivenRides.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No rides published"
            description="Publish a ride to share your trip with others."
            action={
              <Link href="/publish" className="text-brand-600 underline text-sm">
                Publish a ride
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {drivenRides.map((r) => {
              const confirmed = r.bookings.filter(
                (b) => b.status === "CONFIRMED" || b.status === "PENDING"
              );
              return (
                <Card key={r.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(r.departureTime)} · {formatTime(r.departureTime)}
                        </div>
                        <div className="mt-1 text-lg font-semibold flex items-center gap-2">
                          {r.fromCity}
                          <ArrowRight className="h-4 w-4" />
                          {r.toCity}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {r.totalSeats - r.availableSeats}/{r.totalSeats} seats booked ·{" "}
                          {r.vehicle?.make} {r.vehicle?.model}
                        </div>
                      </div>
                      <RideStatusPill status={r.status} />
                    </div>
                    {confirmed.length > 0 && (
                      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        {confirmed.map((b) => (
                          <Link
                            key={b.id}
                            href={`/bookings/${b.id}`}
                            className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-accent"
                          >
                            {b.passenger.name} · {b.seats} seat
                            {b.seats > 1 ? "s" : ""}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <Link
                        href={`/rides/${r.id}`}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        View ride →
                      </Link>
                      <Link
                        href={`/rides/${r.id}/bookings`}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        View bookings →
                      </Link>
                      {(r.status === "SCHEDULED" ||
                        r.status === "IN_PROGRESS") && (
                        <Link
                          href={`/rides/${r.id}/track`}
                          className="text-xs text-brand-600 hover:underline font-medium"
                        >
                          {r.status === "IN_PROGRESS"
                            ? "Open live tracker →"
                            : "Start tracking →"}
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
      )}
    </div>
  );
}

function BookingStatus({ status }: { status: string }) {
  const map: Record<string, any> = {
    PENDING: { variant: "warning", label: "Pending payment" },
    CONFIRMED: { variant: "success", label: "Confirmed" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    COMPLETED: { variant: "muted", label: "Completed" },
    REFUNDED: { variant: "muted", label: "Refunded" },
  };
  const m = map[status] ?? map.PENDING;
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
