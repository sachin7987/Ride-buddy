import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isDriver } from "@/lib/roles";

const schema = z.object({
  type: z.enum(["CAR", "BIKE", "SUV", "AUTO", "OTHER"]),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  color: z.string().min(1),
  plateNumber: z.string().min(4).max(15),
  seats: z.coerce.number().int().min(1).max(10),
  photoUrl: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ vehicles });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDriver((session.user as any).role)) {
    return NextResponse.json(
      { error: "Only driver accounts can register vehicles." },
      { status: 403 }
    );
  }
  try {
    const data = schema.parse(await req.json());
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        plateNumber: data.plateNumber.toUpperCase().replace(/\s/g, ""),
        ownerId: session.user.id,
      },
    });
    return NextResponse.json({ vehicle });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "That number plate is already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: err?.message ?? "Bad request" }, { status: 400 });
  }
}
