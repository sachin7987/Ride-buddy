import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatDate, formatTime } from "@/lib/utils";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      ride: { include: { driver: { select: { name: true, avatarUrl: true } } } },
    },
  });
  if (!booking || booking.passengerId !== user.id) notFound();

  const seatTotal = booking.seats * booking.ride.pricePerSeat;
  const platformFee = booking.totalAmount - seatTotal;

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="text-muted-foreground mt-1">Complete your payment to confirm.</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Trip summary</h3>
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">
                {formatDate(booking.ride.departureTime)} at{" "}
                {formatTime(booking.ride.departureTime)}
              </div>
              <div className="mt-1 font-semibold flex items-center gap-2">
                {booking.ride.fromCity}
                <ArrowRight className="h-4 w-4" />
                {booking.ride.toCity}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Driver: {booking.ride.driver.name} • {booking.seats} seat
                {booking.seats > 1 ? "s" : ""}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <Row
                label={`Seats (${booking.seats} × ${formatINR(
                  booking.ride.pricePerSeat
                )})`}
                value={seatTotal}
              />
              <Row label="Platform fee" value={platformFee} />
              <div className="border-t pt-2 mt-2">
                <Row label="Total" value={booking.totalAmount} bold />
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-brand-600 shrink-0" />
              Payments are secured by Razorpay. We refund automatically if the driver
              cancels.
            </p>
          </CardContent>
        </Card>

        <div>
          <CheckoutForm bookingId={booking.id} amount={booking.totalAmount} />
        </div>
      </div>
    </div>
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
