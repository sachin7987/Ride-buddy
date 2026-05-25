"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteVehicleButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive hover:text-destructive"
      loading={pending}
      onClick={() => {
        if (!confirm("Delete this vehicle?")) return;
        start(async () => {
          const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
          if (res.ok) {
            toast.success("Vehicle deleted");
            router.refresh();
          } else toast.error("Could not delete");
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
