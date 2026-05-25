import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  vehicleId: z.string(),
  action: z.enum(["approve", "reject"]),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = schema.parse(await req.json());
  await prisma.vehicle.update({
    where: { id: data.vehicleId },
    data: {
      isVerified: data.action === "approve",
    },
  });
  return NextResponse.json({ ok: true });
}
