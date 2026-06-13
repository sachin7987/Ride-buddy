import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function publicUser(u: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  kycStatus: string;
  isAdmin: boolean;
  emailVerified: boolean;
}) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    role: u.role,
    kycStatus: u.kycStatus,
    isAdmin: u.isAdmin,
    emailVerified: u.emailVerified,
  };
}

/** Mobile login — validates credentials and returns a bearer token + user. */
export async function POST(req: Request) {
  try {
    const { email, password } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    const token = signMobileToken(user.id);
    return NextResponse.json({ token, user: publicUser(user) });
  } catch (err: any) {
    const message = err?.issues?.[0]?.message ?? err?.message ?? "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
