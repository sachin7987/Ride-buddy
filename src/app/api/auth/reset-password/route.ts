import { NextResponse } from "next/server";
import { z } from "zod";
import { consumePasswordReset } from "@/lib/password-reset";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    const result = await consumePasswordReset(token, password);
    if (!result.ok) {
      const message =
        result.reason === "expired"
          ? "This reset link has expired. Please request a new one."
          : result.reason === "used"
          ? "This reset link has already been used. Please request a new one."
          : "This reset link is invalid. Please request a new one.";
      return NextResponse.json({ error: message, reason: result.reason }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const message =
      err?.issues?.[0]?.message ?? err?.message ?? "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
