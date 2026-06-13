import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public ride detail for the mobile app. */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          ratingAvg: true,
          ratingCount: true,
          kycStatus: true,
          bio: true,
        },
      },
      vehicle: {
        select: {
          type: true,
          make: true,
          model: true,
          color: true,
          year: true,
        },
      },
      stops: { orderBy: { order: "asc" } },
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }
  return NextResponse.json({ ride });
}
