"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      loading={pending}
      onClick={() => {
        if (!confirm("Cancel this booking? This action cannot be undone."))
          return;
        start(async () => {
          const res = await fetch(`/api/bookings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cancel" }),
          });
          if (res.ok) {
            toast.success("Booking cancelled");
            router.refresh();
          } else toast.error("Could not cancel");
        });
      }}
    >
      <X className="h-4 w-4" /> Cancel booking
    </Button>
  );
}
