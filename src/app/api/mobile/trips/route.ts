import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDriver } from "@/lib/roles";

/** Aggregated "My trips" data for the mobile app: bookings made as a
 *  passenger, plus rides published as a driver (when the user is a driver). */
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string | undefined;

  const bookings = await prisma.booking.findMany({
    where: { passengerId: userId },
    include: {
      ride: {
        select: {
          id: true,
          fromCity: true,
          toCity: true,
          departureTime: true,
          status: true,
          pricePerSeat: true,
          driver: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      payment: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const drivenRides = isDriver(role)
    ? await prisma.ride.findMany({
        where: { driverId: userId },
        select: {
          id: true,
          fromCity: true,
          toCity: true,
          departureTime: true,
          status: true,
          totalSeats: true,
          availableSeats: true,
          pricePerSeat: true,
          _count: { select: { bookings: true } },
        },
        orderBy: { departureTime: "desc" },
      })
    : [];

  return NextResponse.json({ bookings, drivenRides, isDriver: isDriver(role) });
}
