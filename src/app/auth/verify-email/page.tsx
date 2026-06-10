import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { consumeEmailVerification } from "@/lib/email-verification";
import { RouterRefresh } from "@/components/router-refresh";

export const dynamic = "force-dynamic";

type SP =
  | Promise<Record<string, string | undefined>>
  | Record<string, string | undefined>;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await Promise.resolve(searchParams);
  const token = sp.token?.trim();

  let state:
    | { kind: "success" }
    | { kind: "already" }
    | { kind: "expired" }
    | { kind: "invalid" }
    | { kind: "missing" };

  if (!token) {
    state = { kind: "missing" };
  } else {
    const result = await consumeEmailVerification(token);
    if (result.ok) state = { kind: "success" };
    else if (result.reason === "already_verified") state = { kind: "already" };
    else if (result.reason === "expired") state = { kind: "expired" };
    else state = { kind: "invalid" };
  }

  const success = state.kind === "success" || state.kind === "already";

  return (
    <div className="min-h-[80vh] py-10 px-4 flex items-center justify-center gradient-hero">
      {/* Bust the client router cache so the unverified-email banner in the
          root layout disappears as soon as the user navigates back to /. */}
      {success && <RouterRefresh />}
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div
            className={cn(
              "mx-auto h-16 w-16 rounded-full flex items-center justify-center",
              success
                ? "bg-brand-100 text-brand-700"
                : "bg-rose-100 text-rose-700"
            )}
          >
            {success ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8" />
            )}
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {state.kind === "success" && "Email verified!"}
            {state.kind === "already" && "Already verified"}
            {state.kind === "expired" && "Link expired"}
            {state.kind === "invalid" && "Invalid link"}
            {state.kind === "missing" && "Missing token"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {state.kind === "success" &&
              "Your email is confirmed. You can now book and publish rides without limits."}
            {state.kind === "already" &&
              "This email address was already confirmed — you're good to go."}
            {state.kind === "expired" &&
              "This verification link is older than 24 hours. Sign in and request a fresh one from the banner at the top of the page."}
            {state.kind === "invalid" &&
              "We couldn't recognise that token. It may have already been used or malformed."}
            {state.kind === "missing" &&
              "The verification link must include a token. Please use the link from your email."}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            {success ? (
              // Plain <a> instead of <Link> so the navigation is a full page
              // load — guarantees the root layout (and its email-verify
              // banner) renders against the freshly-verified session.
              <a
                href="/"
                className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}
              >
                Continue to RideBuddy
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <Link
                href="/auth/signin"
                className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}
              >
                Sign in to resend
              </Link>
            )}
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
