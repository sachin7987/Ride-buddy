"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutForm({
  bookingId,
  amount,
}: {
  bookingId: string;
  amount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = "razorpay-checkout-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  async function pay() {
    setBusy(true);
    const create = await fetch("/api/payments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    if (!create.ok) {
      setBusy(false);
      const data = await create.json().catch(() => ({}));
      return toast.error(data?.error || "Could not start payment");
    }
    const data = await create.json();

    if (data.provider === "mock") {
      // Demo flow — show explanation, simulate redirect
      toast("Demo mode: simulating successful UPI payment…", {
        description: `Add Razorpay test keys to .env to use the real flow.`,
      });
      setTimeout(async () => {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, mock: true }),
        });
        setBusy(false);
        if (res.ok) {
          toast.success("Payment successful — booking confirmed!");
          router.push(`/bookings/${bookingId}`);
        } else toast.error("Verification failed");
      }, 1500);
      return;
    }

    if (data.provider === "razorpay") {
      const RZ = window.Razorpay;
      if (!RZ) {
        setBusy(false);
        return toast.error("Razorpay script not loaded yet, try again");
      }
      const rzp = new RZ({
        key: data.keyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        order_id: data.orderId,
        name: "RideBuddy",
        description: "Ride booking",
        handler: async (response: any) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verify.ok) {
            toast.success("Payment successful — booking confirmed!");
            router.push(`/bookings/${bookingId}`);
          } else toast.error("Payment verification failed");
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
        theme: { color: "#16a97a" },
      });
      rzp.on("payment.failed", () => {
        setBusy(false);
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    }
  }

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Amount to pay</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">{formatINR(amount)}</p>
          <Button
            variant="gradient"
            size="lg"
            className="mt-6 w-full"
            loading={busy}
            onClick={pay}
          >
            Pay now
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            UPI / cards / wallets / netbanking — all supported via Razorpay.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
