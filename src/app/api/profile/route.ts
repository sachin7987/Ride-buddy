import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { requiredKycDocs } from "@/lib/roles";

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

    // If the user's role is changing, we may need to recompute kycStatus —
    // e.g. a verified passenger upgrading to driver now needs a DL too.
    let kycStatusUpdate: { kycStatus: string } | undefined;
    if (data.role) {
      const [current, docs] = await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true, kycStatus: true },
        }),
        prisma.kycDocument.findMany({
          where: { userId: session.user.id },
          select: { type: true, status: true },
        }),
      ]);
      if (current && current.role !== data.role) {
        const required = requiredKycDocs(data.role);
        const approved = new Set(
          docs.filter((d) => d.status === "APPROVED").map((d) => d.type)
        );
        const submitted = new Set(docs.map((d) => d.type));
        let next = "UNVERIFIED";
        if (required.every((t) => approved.has(t))) next = "VERIFIED";
        else if (required.every((t) => submitted.has(t))) next = "PENDING";
        if (next !== current.kycStatus) kycStatusUpdate = { kycStatus: next };
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl || null }),
        ...(data.role && { role: data.role }),
        ...kycStatusUpdate,
      },
      select: { id: true, name: true, role: true, bio: true, avatarUrl: true },
    });
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Bad request" }, { status: 400 });
  }
}
