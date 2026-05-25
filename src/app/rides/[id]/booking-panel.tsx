"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";
import { Users, IndianRupee, ShieldCheck } from "lucide-react";

export function BookingPanel({
  rideId,
  pricePerSeat,
  availableSeats,
  instantBooking,
  isAuthenticated,
}: {
  rideId: string;
  pricePerSeat: number;
  availableSeats: number;
  instantBooking: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);

  const total = seats * pricePerSeat;
  const platformFee = Math.max(10, Math.round(total * 0.05));
  const grandTotal = total + platformFee;

  async function book() {
    if (!isAuthenticated) {
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent(`/rides/${rideId}`)}`
      );
      return;
    }
    setBusy(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rideId, seats }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data?.error || "Booking failed");
    }
    const { booking } = await res.json();
    router.push(`/bookings/${booking.id}/checkout`);
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-3xl font-bold text-brand-600">
          {formatINR(pricePerSeat)}
          <span className="text-sm font-normal text-muted-foreground"> / seat</span>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <Label className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Number of seats
            </Label>
            <Input
              type="number"
              className="mt-1"
              min={1}
              max={availableSeats}
              value={seats}
              onChange={(e) =>
                setSeats(Math.min(availableSeats, Math.max(1, parseInt(e.target.value) || 1)))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              {availableSeats} seat{availableSeats !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <Row label={`Seats (${seats} × ${formatINR(pricePerSeat)})`} value={total} />
          <Row label="Platform fee" value={platformFee} />
          <div className="border-t pt-2 mt-2">
            <Row label="Total" value={grandTotal} bold />
          </div>
        </div>

        <Button
          variant="gradient"
          size="lg"
          className="mt-5 w-full"
          loading={busy}
          onClick={book}
          disabled={availableSeats < seats}
        >
          {instantBooking ? "Book now" : "Request to book"}
        </Button>

        <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-brand-600 shrink-0" />
          {instantBooking
            ? "Your booking is instant. You'll be charged only after the driver confirms departure."
            : "Driver will confirm within a few hours. Free cancellation until confirmation."}
        </p>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-base" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{formatINR(value)}</span>
    </div>
  );
}
