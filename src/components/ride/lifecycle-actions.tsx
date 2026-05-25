"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Play, Square, X, Flag } from "lucide-react";

type Props = {
  rideId: string;
  status: string;
  variant?: "compact" | "full";
};

export function RideLifecycleActions({ rideId, status, variant = "full" }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(action: "start" | "complete" | "cancel", reason?: string) {
    start(async () => {
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        toast.success(
          action === "start"
            ? "Ride started — drive safe!"
            : action === "complete"
            ? "Ride completed. Passengers can now leave reviews."
            : "Ride cancelled. Passengers have been notified."
        );
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Could not update ride");
      }
    });
  }

  if (status === "COMPLETED") {
    return (
      <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
        <Flag className="h-4 w-4 shrink-0" />
        Ride completed. Reviews are now open for your passengers.
      </div>
    );
  }
  if (status === "CANCELLED") {
    return (
      <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800 flex items-center gap-2">
        <X className="h-4 w-4 shrink-0" />
        This ride was cancelled.
      </div>
    );
  }

  const size = variant === "compact" ? "sm" : "default";

  return (
    <div className="flex flex-wrap gap-2">
      {status === "SCHEDULED" && (
        <Button
          variant="gradient"
          size={size}
          loading={pending}
          onClick={() => {
            if (confirm("Start this ride? Passengers will see your live location.")) {
              act("start");
            }
          }}
        >
          <Play className="h-4 w-4" /> Start ride
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <Button
          variant="gradient"
          size={size}
          loading={pending}
          onClick={() => {
            if (confirm("Mark this ride as completed?")) act("complete");
          }}
        >
          <Square className="h-4 w-4" /> Complete ride
        </Button>
      )}
      <Button
        variant="outline"
        size={size}
        loading={pending}
        onClick={() => {
          const reason =
            prompt("Optional reason for cancellation (passengers will see this):") ?? "";
          if (
            confirm(
              "Cancel this ride? All bookings will be cancelled and passengers will be notified."
            )
          ) {
            act("cancel", reason);
          }
        }}
        className="text-destructive hover:text-destructive"
      >
        <X className="h-4 w-4" /> Cancel ride
      </Button>
    </div>
  );
}

/** Compact pill that shows the current ride lifecycle state with appropriate color. */
export function RideStatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string; icon?: any }> = {
    SCHEDULED: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: "Scheduled",
    },
    IN_PROGRESS: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      label: "In progress",
      icon: Play,
    },
    COMPLETED: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      label: "Completed",
      icon: Flag,
    },
    CANCELLED: {
      bg: "bg-rose-100",
      text: "text-rose-700",
      label: "Cancelled",
      icon: X,
    },
  };
  const m = map[status] ?? map.SCHEDULED;
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.bg} ${m.text}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {m.label}
    </span>
  );
}
