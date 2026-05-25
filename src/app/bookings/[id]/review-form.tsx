"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Star } from "lucide-react";

export function ReviewForm({
  rideId,
  toUserId,
}: {
  rideId: string;
  toUserId: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, toUserId, rating, comment }),
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Thanks for your review!");
      router.refresh();
    } else toast.error("Could not save review");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                (hover || rating) >= n
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        rows={3}
        placeholder="How was the ride? Friendly driver, good music…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button variant="gradient" loading={busy}>
        Submit review
      </Button>
    </form>
  );
}
