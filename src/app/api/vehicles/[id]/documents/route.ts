import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { saveFile } from "@/lib/upload";

const ALLOWED = ["RC", "INSURANCE", "PHOTO"] as const;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const v = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!v || v.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const form = await req.formData();
  const type = String(form.get("type") || "");
  const file = form.get("file") as File | null;

  if (!ALLOWED.includes(type as any) || !file) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const fileUrl = await saveFile(file, `vehicles/${v.id}`);
  const patch: Record<string, any> = {};
  if (type === "RC") patch.rcUrl = fileUrl;
  if (type === "INSURANCE") patch.insuranceUrl = fileUrl;
  if (type === "PHOTO") patch.photoUrl = fileUrl;
  // Re-uploading docs resets verification to allow re-review
  if (type === "RC" || type === "INSURANCE") patch.isVerified = false;

  const vehicle = await prisma.vehicle.update({
    where: { id: v.id },
    data: patch,
  });
  return NextResponse.json({ vehicle });
}
