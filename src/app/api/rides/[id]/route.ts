import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDriver } from "@/lib/roles";
import { haversineKm } from "@/lib/utils";
import { fetchDrivingRoute } from "@/lib/routing";

const updateSchema = z
  .object({
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
    description: z.string().max(500).optional().nullable(),
    vehicleId: z.string().optional(),
    allowSmoking: z.boolean().optional(),
    allowPets: z.boolean().optional(),
    allowMusic: z.boolean().optional(),
    instantBooking: z.boolean().optional(),
    womenOnly: z.boolean().optional(),
  })
  .partial();

/** Edit a published ride. Only the owning driver may edit, and only while the
 *  ride is still SCHEDULED. Seats can't drop below what's already booked. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDriver((session.user as any).role)) {
    return NextResponse.json(
      { error: "Only driver accounts can edit rides." },
      { status: 403 }
    );
  }

  const ride = await prisma.ride.findUnique({ where: { id: params.id } });
  if (!ride) {
    return NextResponse.json({ error: "Ride not found" }, { status: 404 });
  }
  if (ride.driverId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (ride.status !== "SCHEDULED") {
    return NextResponse.json(
      { error: `A ${ride.status.toLowerCase()} ride can no longer be edited.` },
      { status: 400 }
    );
  }

  try {
    const data = updateSchema.parse(await req.json());
    const update: Record<string, unknown> = {};

    // Route fields — recompute distance/duration when coordinates change.
    const fromLat = data.fromLat ?? ride.fromLat;
    const fromLng = data.fromLng ?? ride.fromLng;
    const toLat = data.toLat ?? ride.toLat;
    const toLng = data.toLng ?? ride.toLng;
    const coordsChanged =
      fromLat !== ride.fromLat ||
      fromLng !== ride.fromLng ||
      toLat !== ride.toLat ||
      toLng !== ride.toLng;

    for (const key of [
      "fromCity",
      "fromAddress",
      "fromLat",
      "fromLng",
      "toCity",
      "toAddress",
      "toLat",
      "toLng",
      "pricePerSeat",
      "description",
      "vehicleId",
      "allowSmoking",
      "allowPets",
      "allowMusic",
      "instantBooking",
      "womenOnly",
    ] as const) {
      if (data[key] !== undefined) update[key] = data[key];
    }

    if (data.departureTime !== undefined) {
      update.departureTime = new Date(data.departureTime);
    }

    // Seats: never let the total drop below seats already taken.
    if (data.totalSeats !== undefined) {
      const bookedSeats = ride.totalSeats - ride.availableSeats;
      if (data.totalSeats < bookedSeats) {
        return NextResponse.json(
          {
            error: `You already have ${bookedSeats} seat(s) booked — total seats can't be lower than that.`,
          },
          { status: 400 }
        );
      }
      update.totalSeats = data.totalSeats;
      update.availableSeats = data.totalSeats - bookedSeats;
    }

    if (coordsChanged) {
      const realRoute = await fetchDrivingRoute(
        { lat: fromLat, lng: fromLng },
        { lat: toLat, lng: toLng }
      );
      if (realRoute) {
        update.distanceKm = Math.round((realRoute.distance / 1000) * 10) / 10;
        update.durationMin = Math.round(realRoute.duration / 60);
      } else {
        const haversine = haversineKm(
          { lat: fromLat, lng: fromLng },
          { lat: toLat, lng: toLng }
        );
        update.distanceKm = Math.round(haversine * 10) / 10;
        update.durationMin = Math.round((haversine / 50) * 60);
      }
    }

    const updated = await prisma.ride.update({
      where: { id: ride.id },
      data: update,
    });
    return NextResponse.json({ ride: updated });
  } catch (err: any) {
    const message = err?.issues?.[0]?.message ?? err?.message ?? "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
