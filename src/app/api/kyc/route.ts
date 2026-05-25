import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { saveFile } from "@/lib/upload";

const ALLOWED = ["DRIVING_LICENSE", "AADHAAR", "SELFIE", "PAN"] as const;

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const docs = await prisma.kycDocument.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { kycStatus: true },
  });
  return NextResponse.json({ status: user?.kycStatus, documents: docs });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const type = String(form.get("type") || "");
  const number = (form.get("number") as string | null) ?? undefined;
  const file = form.get("file") as File | null;

  if (!ALLOWED.includes(type as any) || !file) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const fileUrl = await saveFile(file, `kyc/${session.user.id}`);

  // Replace any prior unapproved doc of same type
  await prisma.kycDocument.deleteMany({
    where: { userId: session.user.id, type, status: { not: "APPROVED" } },
  });

  const doc = await prisma.kycDocument.create({
    data: {
      userId: session.user.id,
      type,
      number,
      fileUrl,
      status: "PENDING",
    },
  });

  // If user has all three (DL, Aadhaar, Selfie) submitted, mark overall status PENDING
  const have = await prisma.kycDocument.findMany({
    where: { userId: session.user.id },
    select: { type: true, status: true },
  });
  const types = new Set(have.map((d) => d.type));
  if (
    types.has("DRIVING_LICENSE") &&
    types.has("AADHAAR") &&
    types.has("SELFIE")
  ) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { kycStatus: "PENDING" },
    });
  }

  return NextResponse.json({ document: doc });
}
