import { prisma } from "@/lib/prisma";
import { requireUser, userIsDriver, userIsPassenger } from "@/lib/session";
import { formatINR, formatDate, formatTime } from "@/lib/utils";
import {
  TripsView,
  type PassengerTrip,
  type DriverTrip,
} from "./trips-view";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }> | { mode?: string };
}) {
  const user = await requireUser();
  const canDrive = userIsDriver(user);
  const canRide = userIsPassenger(user);

  const sp = await Promise.resolve(searchParams);
  const initialMode = sp.mode === "driver" && canDrive ? "driver" : "passenger";

  const [bookings, drivenRides] = await Promise.all([
    canRide
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
    canDrive
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

  const passengerTrips: PassengerTrip[] = bookings.map((b) => ({
    id: b.id,
    dateLabel: formatDate(b.ride.departureTime),
    timeLabel: formatTime(b.ride.departureTime),
    fromCity: b.ride.fromCity,
    toCity: b.ride.toCity,
    seats: b.seats,
    driverName: b.ride.driver.name,
    bookingStatus: b.status,
    rideStatus: b.ride.status,
    amountLabel: formatINR(b.totalAmount),
  }));

  const driverTrips: DriverTrip[] = drivenRides.map((r) => {
    const confirmed = r.bookings.filter(
      (b) => b.status === "CONFIRMED" || b.status === "PENDING"
    );
    const canTrack = r.status === "SCHEDULED" || r.status === "IN_PROGRESS";
    return {
      id: r.id,
      dateLabel: formatDate(r.departureTime),
      timeLabel: formatTime(r.departureTime),
      fromCity: r.fromCity,
      toCity: r.toCity,
      seatsBooked: r.totalSeats - r.availableSeats,
      totalSeats: r.totalSeats,
      vehicleLabel: r.vehicle ? `${r.vehicle.make} ${r.vehicle.model}` : "",
      rideStatus: r.status,
      confirmed: confirmed.map((b) => ({
        id: b.id,
        passengerName: b.passenger.name,
        seats: b.seats,
      })),
      trackHref: canTrack ? `/rides/${r.id}/track` : null,
      trackLabel: canTrack
        ? r.status === "IN_PROGRESS"
          ? "Live tracker"
          : "Start tracking"
        : null,
    };
  });

  return (
    <div className="container max-w-5xl py-6">
      <h1 className="text-2xl font-bold">My trips</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {canDrive
          ? "Switch between the rides you've booked and the rides you're driving."
          : "All the rides you've booked, in one place."}
      </p>

      <TripsView
        canDrive={canDrive}
        passengerTrips={passengerTrips}
        driverTrips={driverTrips}
        initialMode={initialMode}
      />
    </div>
  );
}
