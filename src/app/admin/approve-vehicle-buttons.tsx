"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function ApproveVehicleButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(action: "approve" | "reject") {
    start(async () => {
      const res = await fetch("/api/admin/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: id, action }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Vehicle approved" : "Vehicle rejected");
        router.refresh();
      } else {
        toast.error("Action failed");
      }
    });
  }

  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button
        variant="destructive"
        loading={pending}
        onClick={() => act("reject")}
      >
        <X className="h-4 w-4" /> Reject
      </Button>
      <Button variant="gradient" loading={pending} onClick={() => act("approve")}>
        <Check className="h-4 w-4" /> Approve vehicle
      </Button>
    </div>
  );
}
