"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Car, User, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "PASSENGER",
    icon: User,
    title: "I'm a passenger",
    text: "I want to find rides going my way and travel cheap.",
  },
  {
    id: "DRIVER",
    icon: Car,
    title: "I'm a driver",
    text: "I'll share my car/bike with passengers heading the same direction.",
  },
  {
    id: "BOTH",
    icon: ArrowRight,
    title: "Both",
    text: "Sometimes I drive, sometimes I'm a passenger. (Recommended)",
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [role, setRole] = useState<"PASSENGER" | "DRIVER" | "BOTH">("BOTH");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, bio }),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Could not save");
      return;
    }
    await update();
    toast.success("Profile saved! Let's verify your ID next.");
    router.push("/kyc");
  }

  return (
    <div className="container max-w-3xl py-10 md:py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-1 rounded-full border bg-secondary/60 px-3 py-1 text-xs font-medium">
          Step 1 of 2 · Tell us about you
        </span>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold">How will you use RideBuddy?</h1>
        <p className="mt-2 text-muted-foreground">
          You can change this later from your profile.
        </p>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {ROLES.map((r) => {
          const active = role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={cn(
                "rounded-2xl border-2 p-6 text-left transition-all",
                active
                  ? "border-brand-500 bg-brand-50 shadow-md"
                  : "border-border hover:border-brand-300 bg-card"
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  active ? "bg-brand-500 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <r.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 font-semibold">{r.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{r.text}</div>
            </button>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <label className="text-sm font-medium">A short intro (optional)</label>
          <Textarea
            className="mt-2"
            rows={3}
            placeholder="Hi, I'm a software engineer in Bengaluru. I love road trips and good music!"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          Next: ID verification (DL + Aadhaar) — required for both drivers & passengers.
        </p>
        <Button variant="gradient" size="lg" onClick={submit} loading={loading}>
          Save & continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
