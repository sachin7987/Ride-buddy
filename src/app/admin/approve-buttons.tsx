"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

export function ApproveButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");

  function act(action: "approve" | "reject") {
    start(async () => {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: id, action, reviewNote: note }),
      });
      if (res.ok) {
        toast.success(action === "approve" ? "Approved" : "Rejected");
        router.refresh();
      } else toast.error("Action failed");
    });
  }

  return (
    <div className="mt-3 flex flex-col sm:flex-row gap-2">
      <Input
        placeholder="Optional review note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex gap-2">
        <Button
          variant="destructive"
          loading={pending}
          onClick={() => act("reject")}
        >
          <X className="h-4 w-4" /> Reject
        </Button>
        <Button variant="gradient" loading={pending} onClick={() => act("approve")}>
          <Check className="h-4 w-4" /> Approve
        </Button>
      </div>
    </div>
  );
}
