import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  role: z.enum(["PASSENGER", "DRIVER", "BOTH"]).optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
        ...(data.role && { role: data.role }),
      },
      select: { id: true, name: true, role: true, bio: true, avatarUrl: true },
    });
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Bad request" }, { status: 400 });
  }
}
