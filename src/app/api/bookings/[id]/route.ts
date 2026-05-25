import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      ride: {
        include: {
          driver: { select: { id: true, name: true, avatarUrl: true, phone: true } },
          vehicle: true,
        },
      },
      payment: true,
    },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    booking.passengerId !== session.user.id &&
    booking.ride.driverId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ booking });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const action = body.action as string;

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { ride: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isPassenger = booking.passengerId === session.user.id;
  const isDriver = booking.ride.driverId === session.user.id;

  if (action === "cancel" && (isPassenger || isDriver)) {
    if (booking.status === "CANCELLED")
      return NextResponse.json({ ok: true });
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          cancelReason: body.reason ?? "User cancelled",
        },
      }),
      // Restore seats only if booking was confirmed
      ...(booking.status === "CONFIRMED"
        ? [
            prisma.ride.update({
              where: { id: booking.rideId },
              data: { availableSeats: { increment: booking.seats } },
            }),
          ]
        : []),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (action === "confirm" && isDriver) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
