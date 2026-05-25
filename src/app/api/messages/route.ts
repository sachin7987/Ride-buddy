import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const postSchema = z.object({
  rideId: z.string(),
  toUserId: z.string(),
  content: z.string().min(1).max(1000),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const rideId = url.searchParams.get("rideId");
  const otherUserId = url.searchParams.get("with");
  if (!rideId || !otherUserId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  const messages = await prisma.message.findMany({
    where: {
      rideId,
      OR: [
        { fromUserId: session.user.id, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = postSchema.parse(await req.json());
    const message = await prisma.message.create({
      data: {
        rideId: data.rideId,
        fromUserId: session.user.id,
        toUserId: data.toUserId,
        content: data.content,
      },
    });
    return NextResponse.json({ message });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Bad request" }, { status: 400 });
  }
}
