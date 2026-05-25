import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDriver } from "@/lib/roles";
import { haversineKm } from "@/lib/utils";
import { fetchDrivingRoute } from "@/lib/routing";

const createSchema = z.object({
  fromCity: z.string().min(1),
  fromAddress: z.string().min(1),
  fromLat: z.number(),
  fromLng: z.number(),
  toCity: z.string().min(1),
  toAddress: z.string().min(1),
  toLat: z.number(),
  toLng: z.number(),
  departureTime: z.string(),
  totalSeats: z.number().int().min(1).max(8),
  pricePerSeat: z.number().min(0).max(100000),
  description: z.string().max(500).optional(),
  vehicleId: z.string().optional(),
  allowSmoking: z.boolean().optional(),
  allowPets: z.boolean().optional(),
  allowMusic: z.boolean().optional(),
  instantBooking: z.boolean().optional(),
  womenOnly: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDriver((session.user as any).role)) {
    return NextResponse.json(
      { error: "Only driver accounts can publish rides. Update your role in Profile." },
      { status: 403 }
    );
  }
  try {
    const data = createSchema.parse(await req.json());

    // Try real road routing first; fall back to Haversine straight line
    const realRoute = await fetchDrivingRoute(
      { lat: data.fromLat, lng: data.fromLng },
      { lat: data.toLat, lng: data.toLng }
    );
    let distanceKm: number;
    let durationMin: number;
    if (realRoute) {
      distanceKm = Math.round((realRoute.distance / 1000) * 10) / 10;
      durationMin = Math.round(realRoute.duration / 60);
    } else {
      const haversine = haversineKm(
        { lat: data.fromLat, lng: data.fromLng },
        { lat: data.toLat, lng: data.toLng }
      );
      distanceKm = Math.round(haversine * 10) / 10;
      durationMin = Math.round((haversine / 50) * 60);
    }

    const ride = await prisma.ride.create({
      data: {
        driverId: session.user.id,
        vehicleId: data.vehicleId,
        fromCity: data.fromCity,
        fromAddress: data.fromAddress,
        fromLat: data.fromLat,
        fromLng: data.fromLng,
        toCity: data.toCity,
        toAddress: data.toAddress,
        toLat: data.toLat,
        toLng: data.toLng,
        departureTime: new Date(data.departureTime),
        totalSeats: data.totalSeats,
        availableSeats: data.totalSeats,
        pricePerSeat: data.pricePerSeat,
        description: data.description,
        allowSmoking: data.allowSmoking ?? false,
        allowPets: data.allowPets ?? false,
        allowMusic: data.allowMusic ?? true,
        instantBooking: data.instantBooking ?? true,
        womenOnly: data.womenOnly ?? false,
        distanceKm,
        durationMin,
      },
    });
    return NextResponse.json({ ride });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Bad request" }, { status: 400 });
  }
}

// Public search
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fromCity = url.searchParams.get("from") || undefined;
  const toCity = url.searchParams.get("to") || undefined;
  const date = url.searchParams.get("date");
  const seats = parseInt(url.searchParams.get("seats") || "1", 10);

  const where: any = {
    status: "SCHEDULED",
    availableSeats: { gte: seats },
    departureTime: { gte: new Date() },
  };
  if (fromCity) where.fromCity = { contains: fromCity };
  if (toCity) where.toCity = { contains: toCity };
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.departureTime = { gte: d, lt: next };
  }

  const rides = await prisma.ride.findMany({
    where,
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          ratingAvg: true,
          ratingCount: true,
          kycStatus: true,
        },
      },
      vehicle: { select: { type: true, make: true, model: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { departureTime: "asc" },
    take: 100,
  });

  return NextResponse.json({ rides });
}
