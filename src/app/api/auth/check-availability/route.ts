import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmail } from "@/lib/email-validation";

/**
 * GET /api/auth/check-availability?email=…   → { available: boolean }
 * GET /api/auth/check-availability?phone=…   → { available: boolean }
 *
 * Lightweight pre-flight check used by the signup form to surface
 * "already in use" errors before the user finishes the whole flow.
 *
 * Both queries return a deliberately uniform shape so the client doesn't
 * leak information ("does this email exist?") in a way that's distinguishable
 * from "is this a syntactically invalid email?". Specifically:
 *  - invalid input  → { available: false, reason: "invalid" }
 *  - taken          → { available: false, reason: "taken" }
 *  - free           → { available: true }
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const phone = url.searchParams.get("phone");

  if (email && !phone) {
    const check = validateEmail(email);
    if (!check.ok) {
      return NextResponse.json({
        available: false,
        reason: "invalid",
        message: check.message,
      });
    }
    const exists = await prisma.user.findUnique({
      where: { email: check.email },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json({
        available: false,
        reason: "taken",
        message: "An account with this email already exists.",
      });
    }
    return NextResponse.json({ available: true });
  }

  if (phone && !email) {
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json({
        available: false,
        reason: "invalid",
        message: "Phone must be 10 digits.",
      });
    }
    const exists = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json({
        available: false,
        reason: "taken",
        message: "An account with this phone number already exists.",
      });
    }
    return NextResponse.json({ available: true });
  }

  return NextResponse.json(
    { error: "Pass exactly one of ?email= or ?phone=" },
    { status: 400 }
  );
}
