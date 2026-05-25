import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  rideId: z.string(),
  seats: z.number().int().min(1).max(8),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }
  try {
    const data = schema.parse(await req.json());

    // Use a transaction to safely decrement seats
    const result = await prisma.$transaction(async (tx) => {
      const ride = await tx.ride.findUnique({ where: { id: data.rideId } });
      if (!ride) throw new Error("Ride not found");
      if (ride.driverId === session.user.id)
        throw new Error("You can't book your own ride");
      if (ride.status !== "SCHEDULED") throw new Error("Ride no longer available");
      if (ride.availableSeats < data.seats)
        throw new Error("Not enough seats available");

      const dbUser = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { kycStatus: true },
      });
      if (dbUser?.kycStatus !== "VERIFIED") {
        throw new Error(
          "Please complete identity verification before booking. /kyc"
        );
      }

      const total = data.seats * ride.pricePerSeat;
      const platformFee = Math.max(10, Math.round(total * 0.05));

      const booking = await tx.booking.create({
        data: {
          rideId: ride.id,
          passengerId: session.user.id,
          seats: data.seats,
          totalAmount: total + platformFee,
          status: "PENDING",
        },
      });
      return booking;
    });

    return NextResponse.json({ booking: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Booking failed" },
      { status: 400 }
    );
  }
}
