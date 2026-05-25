import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
  password: z.string().min(6),
  role: z.enum(["PASSENGER", "DRIVER", "BOTH"]).default("BOTH"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: data.email.toLowerCase() }, { phone: data.phone }] },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Email or phone already in use" },
        { status: 409 }
      );
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        phone: data.phone,
        name: data.name.trim(),
        passwordHash,
        role: data.role,
      },
      select: { id: true, email: true, name: true },
    });
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Bad request" },
      { status: 400 }
    );
  }
}
