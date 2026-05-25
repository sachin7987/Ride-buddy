import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  rideId: z.string(),
  lat: z.number(),
  lng: z.number(),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = schema.parse(await req.json());
  const ride = await prisma.ride.findUnique({ where: { id: data.rideId } });
  if (!ride) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // only driver or active passengers may post
  const isDriver = ride.driverId === session.user.id;
  let allowed = isDriver;
  if (!allowed) {
    const booking = await prisma.booking.findFirst({
      where: {
        rideId: data.rideId,
        passengerId: session.user.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    });
    allowed = !!booking;
  }
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const location = await prisma.location.create({
    data: {
      userId: session.user.id,
      rideId: data.rideId,
      lat: data.lat,
      lng: data.lng,
      heading: data.heading ?? null,
      speed: data.speed ?? null,
    },
  });
  return NextResponse.json({ location });
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const rideId = url.searchParams.get("rideId");
  if (!rideId) return NextResponse.json({ error: "Missing rideId" }, { status: 400 });

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    select: { driverId: true },
  });
  if (!ride) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Latest driver location
  const driverLoc = await prisma.location.findFirst({
    where: { rideId, userId: ride.driverId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ driver: driverLoc });
}
