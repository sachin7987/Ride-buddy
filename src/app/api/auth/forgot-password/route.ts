import { NextResponse } from "next/server";
import { z } from "zod";
import { issuePasswordReset } from "@/lib/password-reset";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const result = await issuePasswordReset(email);

    // Always return a generic success — never reveal whether the email is
    // registered. `devUrl` is only populated in non-production builds.
    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for that email, we've sent a password reset link.",
      devUrl: result.devUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Bad request" },
      { status: 400 }
    );
  }
}
