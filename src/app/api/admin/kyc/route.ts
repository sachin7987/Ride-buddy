import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  documentId: z.string(),
  action: z.enum(["approve", "reject"]),
  reviewNote: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = schema.parse(await req.json());

  const doc = await prisma.kycDocument.update({
    where: { id: data.documentId },
    data: {
      status: data.action === "approve" ? "APPROVED" : "REJECTED",
      reviewNote: data.reviewNote,
      reviewedAt: new Date(),
    },
  });

  // Recompute user kyc status
  const userDocs = await prisma.kycDocument.findMany({
    where: { userId: doc.userId },
  });
  const types = userDocs.reduce<Record<string, string>>((acc, d) => {
    acc[d.type] = d.status;
    return acc;
  }, {});
  const required = ["DRIVING_LICENSE", "AADHAAR", "SELFIE"];
  let status = "UNVERIFIED";
  if (required.every((t) => types[t] === "APPROVED")) status = "VERIFIED";
  else if (required.some((t) => types[t] === "REJECTED")) status = "REJECTED";
  else if (required.every((t) => !!types[t])) status = "PENDING";
  await prisma.user.update({
    where: { id: doc.userId },
    data: { kycStatus: status },
  });

  return NextResponse.json({ ok: true, status });
}
