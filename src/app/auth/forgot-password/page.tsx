"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.");
        return;
      }
      // Dev convenience: when no mail provider is configured the API returns
      // the reset link so you can continue testing without an inbox.
      if (data.devUrl) {
        console.info("[forgot-password] dev reset link:", data.devUrl);
        toast.success("Reset link generated (check the server console in dev).");
      }
      setSent(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] py-10 px-4 flex items-center justify-center gradient-hero">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-brand-100 text-brand-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-5 text-2xl font-bold">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>,
                we&apos;ve sent a link to reset your password. The link expires
                in 1 hour.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link href="/auth/signin">
                  <Button variant="gradient" className="w-full" size="lg">
                    Back to sign in
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Use a different email
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Forgot password?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the email linked to your account and we&apos;ll send you a
                reset link.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      className="pl-9"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  loading={loading}
                >
                  Send reset link
                </Button>
              </form>
              <p className="mt-6 text-sm text-center">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to sign in
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
