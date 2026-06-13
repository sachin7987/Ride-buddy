import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { verifyResetToken } from "@/lib/password-reset";
import { ResetPasswordForm } from "./reset-form";

export const dynamic = "force-dynamic";

type SP =
  | Promise<Record<string, string | undefined>>
  | Record<string, string | undefined>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await Promise.resolve(searchParams);
  const token = sp.token?.trim();

  const check = token ? await verifyResetToken(token) : { ok: false, reason: "invalid" as const };

  if (!check.ok) {
    const reason = "reason" in check ? check.reason : "invalid";
    const title =
      reason === "expired"
        ? "Link expired"
        : reason === "used"
        ? "Link already used"
        : "Invalid link";
    const message =
      reason === "expired"
        ? "This reset link is older than 1 hour. Request a fresh one to continue."
        : reason === "used"
        ? "This reset link has already been used. Request a new one if you still need to reset your password."
        : "We couldn't recognise this reset link. It may be malformed or incomplete.";

    return (
      <div className="min-h-[80vh] py-10 px-4 flex items-center justify-center gradient-hero">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-rose-100 text-rose-700">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/auth/forgot-password"
                className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}
              >
                Request a new link
              </Link>
              <Link
                href="/auth/signin"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-10 px-4 flex items-center justify-center gradient-hero">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a strong password you don&apos;t use anywhere else.
          </p>
          <ResetPasswordForm token={token!} />
        </CardContent>
      </Card>
    </div>
  );
}
