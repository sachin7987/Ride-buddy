"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Users,
  Car,
  Sparkles,
  Check,
  ShieldAlert,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type UserRole } from "@/lib/roles";

const ROLE_OPTIONS: {
  value: UserRole;
  title: string;
  desc: string;
  perks: string[];
  icon: any;
}[] = [
  {
    value: "PASSENGER",
    title: "Passenger only",
    desc: "Find rides going your way.",
    perks: [
      "Search and book rides",
      "Only Aadhaar + selfie KYC needed",
      "Live tracking and in-app chat with drivers",
    ],
    icon: Users,
  },
  {
    value: "DRIVER",
    title: "Driver only",
    desc: "Share your trip, earn money.",
    perks: [
      "Publish rides and accept passengers",
      "Manage your vehicles and routes",
      "Driving license, Aadhaar + selfie KYC",
    ],
    icon: Car,
  },
  {
    value: "BOTH",
    title: "Both",
    desc: "Drive sometimes, ride sometimes.",
    perks: [
      "Full access to all features",
      "Switch hats anytime — no extra setup",
      "Driving license, Aadhaar + selfie KYC",
    ],
    icon: Sparkles,
  },
];

export function ModeSwitcherForm({
  currentRole,
  kycStatus,
}: {
  currentRole: UserRole;
  kycStatus: string;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [selected, setSelected] = useState<UserRole>(currentRole);
  const [pending, startTransition] = useTransition();

  const changed = selected !== currentRole;

  // If the user is VERIFIED today but switching from PASSENGER to a driver role,
  // they'll be dropped to PENDING/UNVERIFIED on the server because a DL is now
  // required. Warn them up-front so it doesn't come as a surprise.
  const willNeedReverify =
    changed &&
    kycStatus === "VERIFIED" &&
    currentRole === "PASSENGER" &&
    selected !== "PASSENGER";

  async function save() {
    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Could not switch mode");
        return;
      }
      // refresh session so navbar etc. update immediately
      await update();
      toast.success(
        selected === "PASSENGER"
          ? "You're now in passenger mode."
          : selected === "DRIVER"
          ? "You're now in driver mode."
          : "You're now in both modes."
      );
      router.refresh();
      // Send drivers who don't yet have docs to KYC; passengers can stay put.
      if (willNeedReverify) router.push("/kyc");
      else router.push("/profile");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        {ROLE_OPTIONS.map((opt) => {
          const isSelected = selected === opt.value;
          const isCurrent = currentRole === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={cn(
                "relative text-left rounded-2xl border-2 p-5 transition-all flex flex-col gap-2 h-full",
                isSelected
                  ? "border-brand-500 bg-brand-50 shadow-md"
                  : "border-border bg-card hover:border-brand-300 hover:bg-accent/40"
              )}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
              {isCurrent && (
                <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded-full">
                  Current
                </span>
              )}
              <div
                className={cn(
                  "mt-6 h-10 w-10 rounded-xl flex items-center justify-center",
                  isSelected
                    ? "bg-brand-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">{opt.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {opt.desc}
                </div>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {opt.perks.map((p) => (
                  <li key={p} className="flex items-start gap-1.5">
                    <Check className="h-3 w-3 mt-0.5 text-brand-600 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {willNeedReverify && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-start gap-3 text-sm">
            <ShieldAlert className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-amber-900">
                You'll need to upload your driving license
              </p>
              <p className="text-amber-800 mt-1 text-xs">
                Drivers need a DL on file in addition to Aadhaar and a selfie.
                We'll take you to the KYC page right after saving so you can
                upload it.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {changed && !willNeedReverify && (
        <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Your existing bookings, vehicles and rides are untouched. Only the
            options available in the menu will change.
          </span>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/profile")}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gradient"
          size="lg"
          className="flex-1"
          onClick={save}
          loading={pending}
          disabled={!changed}
        >
          {changed ? "Save changes" : "No changes"}
        </Button>
      </div>
    </div>
  );
}
