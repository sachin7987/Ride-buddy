import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateSchema = z.object({
  type: z.enum(["CAR", "BIKE", "SUV", "AUTO", "OTHER"]).optional(),
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  color: z.string().min(1).optional(),
  plateNumber: z.string().min(4).max(15).optional(),
  seats: z.coerce.number().int().min(1).max(10).optional(),
  photoUrl: z.string().optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const v = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!v || v.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ vehicle: v });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const v = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!v || v.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const data = updateSchema.parse(await req.json());
    const platePatch = data.plateNumber
      ? { plateNumber: data.plateNumber.toUpperCase().replace(/\s/g, "") }
      : {};
    // Editing critical fields invalidates verification — must re-verify.
    const criticalChange =
      (data.plateNumber && data.plateNumber !== v.plateNumber) ||
      (data.make && data.make !== v.make) ||
      (data.model && data.model !== v.model) ||
      (data.year && data.year !== v.year);

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        ...data,
        ...platePatch,
        ...(criticalChange && v.isVerified ? { isVerified: false } : {}),
      },
    });
    return NextResponse.json({ vehicle, reverificationRequired: criticalChange && v.isVerified });
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

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const v = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!v || v.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.vehicle.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
