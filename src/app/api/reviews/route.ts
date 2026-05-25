import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  rideId: z.string(),
  toUserId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = schema.parse(await req.json());
    if (data.toUserId === session.user.id) {
      return NextResponse.json({ error: "You can't review yourself" }, { status: 400 });
    }
    const review = await prisma.review.upsert({
      where: {
        rideId_fromUserId_toUserId: {
          rideId: data.rideId,
          fromUserId: session.user.id,
          toUserId: data.toUserId,
        },
      },
      update: { rating: data.rating, comment: data.comment },
      create: {
        rideId: data.rideId,
        fromUserId: session.user.id,
        toUserId: data.toUserId,
        rating: data.rating,
        comment: data.comment,
      },
    });
    // recompute aggregate
    const agg = await prisma.review.aggregate({
      where: { toUserId: data.toUserId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.user.update({
      where: { id: data.toUserId },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count,
      },
    });
    return NextResponse.json({ review });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Bad request" }, { status: 400 });
  }
}
