import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/email-validation";
import { issueEmailVerification } from "@/lib/email-verification";

const schema = z.object({
  name: z.string().min(2),
  email: z.string(),
  phone: z.string().regex(/^\d{10}$/),
  password: z.string().min(6),
  role: z.enum(["PASSENGER", "DRIVER", "BOTH"]).default("BOTH"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Stricter email checks (format, disposable, typos) — surface a friendly
    // message back to the form so the user can fix it inline.
    const emailCheck = validateEmail(data.email);
    if (!emailCheck.ok) {
      return NextResponse.json(
        {
          error: emailCheck.message,
          field: "email",
          suggestion: "suggestion" in emailCheck ? emailCheck.suggestion : undefined,
        },
        { status: 400 }
      );
    }
    const email = emailCheck.email;

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone: data.phone }] },
      select: { email: true, phone: true },
    });
    if (exists) {
      // Tell the client *which* identifier collided so the form can highlight
      // the right input — generic "email or phone in use" leaves the user
      // guessing which one to change.
      const field = exists.email === email ? "email" : "phone";
      const message =
        field === "email"
          ? "An account with this email already exists."
          : "An account with this phone number already exists.";
      return NextResponse.json({ error: message, field }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        phone: data.phone,
        name: data.name.trim(),
        passwordHash,
        role: data.role,
      },
      select: { id: true, email: true, name: true },
    });

    // Fire-and-forget — if email delivery fails the account is still created
    // and the user can request a resend from the in-app banner.
    let devUrl: string | undefined;
    try {
      const result = await issueEmailVerification(user.id);
      if ("devUrl" in result) devUrl = result.devUrl;
    } catch (err) {
      console.error("[register] verification email failed", err);
    }

    return NextResponse.json({ user, verificationDevUrl: devUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Bad request" },
      { status: 400 }
    );
  }
}
