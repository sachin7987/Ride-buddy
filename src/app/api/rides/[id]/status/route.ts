import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  action: z.enum(["start", "complete", "cancel"]),
  reason: z.string().max(300).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ride = await prisma.ride.findUnique({ where: { id: params.id } });
  if (!ride) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ride.driverId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, reason } = schema.parse(await req.json());

  // ── start: SCHEDULED → IN_PROGRESS ────────────────────────────────────────
  if (action === "start") {
    if (ride.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: `Cannot start a ride in ${ride.status} state` },
        { status: 400 }
      );
    }
    const updated = await prisma.ride.update({
      where: { id: ride.id },
      data: { status: "IN_PROGRESS", startedAt: new Date() },
    });
    return NextResponse.json({ ride: updated });
  }

  // ── complete: IN_PROGRESS (or SCHEDULED) → COMPLETED ──────────────────────
  if (action === "complete") {
    if (ride.status !== "IN_PROGRESS" && ride.status !== "SCHEDULED") {
      return NextResponse.json(
        { error: `Cannot complete a ride in ${ride.status} state` },
        { status: 400 }
      );
    }
    const [updated] = await prisma.$transaction([
      prisma.ride.update({
        where: { id: ride.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          startedAt: ride.startedAt ?? new Date(),
        },
      }),
      // Cascade: confirmed bookings become COMPLETED so passengers can review
      prisma.booking.updateMany({
        where: { rideId: ride.id, status: "CONFIRMED" },
        data: { status: "COMPLETED" },
      }),
    ]);
    return NextResponse.json({ ride: updated });
  }

  // ── cancel: SCHEDULED | IN_PROGRESS → CANCELLED ───────────────────────────
  if (action === "cancel") {
    if (ride.status !== "SCHEDULED" && ride.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: `Cannot cancel a ride in ${ride.status} state` },
        { status: 400 }
      );
    }
    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.ride.update({
        where: { id: ride.id },
        data: {
          status: "CANCELLED",
          completedAt: new Date(),
        },
      });
      // Cancel all non-terminal bookings; refunds would be triggered here in prod.
      await tx.booking.updateMany({
        where: {
          rideId: ride.id,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        data: {
          status: "CANCELLED",
          cancelReason: reason ?? "Driver cancelled the ride",
        },
      });
      return r;
    });
    return NextResponse.json({ ride: updated });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
