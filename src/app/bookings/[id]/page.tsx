import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RideStatusPill } from "@/components/ride/lifecycle-actions";
import { formatDate, formatTime, formatINR } from "@/lib/utils";
import { ArrowRight, Phone, Star, MessageSquare } from "lucide-react";
import { Chat } from "@/components/chat";
import { LiveMap } from "@/components/live-map";
import { CancelBookingButton } from "./cancel";
import { ReviewForm } from "./review-form";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const me = await requireUser();
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      ride: {
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              phone: true,
              ratingAvg: true,
              ratingCount: true,
            },
          },
          vehicle: true,
        },
      },
      passenger: {
        select: { id: true, name: true, avatarUrl: true, phone: true },
      },
      payment: true,
    },
  });
  if (!booking) notFound();
  const isPassenger = booking.passengerId === me.id;
  const isDriver = booking.ride.driverId === me.id;
  if (!isPassenger && !isDriver) notFound();

  const other = isPassenger ? booking.ride.driver : booking.passenger;
  const existingReview = isPassenger
    ? await prisma.review.findFirst({
        where: {
          rideId: booking.rideId,
          fromUserId: me.id,
          toUserId: booking.ride.driverId,
        },
      })
    : null;

  const isPast = new Date(booking.ride.departureTime) < new Date();
  const rideCompleted = booking.ride.status === "COMPLETED";
  const canReview =
    isPassenger &&
    (rideCompleted || (booking.status === "CONFIRMED" && isPast));
  const canCancel =
    !isPast &&
    booking.ride.status === "SCHEDULED" &&
    booking.status !== "CANCELLED" &&
    booking.status !== "COMPLETED";

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href="/bookings"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All trips
      </Link>

      <div className="mt-4 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(booking.ride.departureTime)} ·{" "}
                    {formatTime(booking.ride.departureTime)}
                  </div>
                  <h1 className="mt-1 text-2xl font-bold flex items-center gap-2">
                    {booking.ride.fromCity}
                    <ArrowRight className="h-5 w-5" />
                    {booking.ride.toCity}
                  </h1>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <BookingBadge status={booking.status} />
                  <RideStatusPill status={booking.ride.status} />
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <Field label="Pickup" value={booking.ride.fromAddress} />
                <Field label="Drop" value={booking.ride.toAddress} />
                <Field label="Seats" value={`${booking.seats}`} />
                <Field label="Total paid" value={formatINR(booking.totalAmount)} />
                {booking.ride.vehicle && (
                  <Field
                    label="Vehicle"
                    value={`${booking.ride.vehicle.make} ${booking.ride.vehicle.model} • ${booking.ride.vehicle.plateNumber}`}
                  />
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {canCancel && <CancelBookingButton id={booking.id} />}
                {booking.status === "PENDING" && isPassenger && (
                  <Link href={`/bookings/${booking.id}/checkout`}>
                    <Button variant="gradient">Pay now</Button>
                  </Link>
                )}
                {isDriver && booking.ride.status === "SCHEDULED" && (
                  <Link href={`/rides/${booking.ride.id}/track`}>
                    <Button variant="outline">Open tracker</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live tracking — visible while the ride hasn't yet completed/cancelled */}
          {booking.status === "CONFIRMED" &&
            (booking.ride.status === "SCHEDULED" ||
              booking.ride.status === "IN_PROGRESS") && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    Live tracking
                    {booking.ride.status === "IN_PROGRESS" && (
                      <span className="inline-flex items-center gap-1 text-xs font-normal text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Trip in progress
                      </span>
                    )}
                  </h3>
                  <LiveMap
                    rideId={booking.rideId}
                    from={{
                      lat: booking.ride.fromLat,
                      lng: booking.ride.fromLng,
                    }}
                    to={{ lat: booking.ride.toLat, lng: booking.ride.toLng }}
                    amDriver={isDriver}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Driver location refreshes every 10 seconds during the trip.
                  </p>
                </CardContent>
              </Card>
            )}

          {/* Chat */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Messages
              </h3>
              <Chat
                rideId={booking.rideId}
                otherUserId={other.id}
                otherUserName={other.name}
                otherUserAvatar={other.avatarUrl}
              />
            </CardContent>
          </Card>

          {/* Review */}
          {canReview && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Rate your driver
                </h3>
                {existingReview ? (
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < existingReview.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground">
                      {existingReview.comment || "(no comment)"}
                    </p>
                  </div>
                ) : (
                  <ReviewForm
                    rideId={booking.rideId}
                    toUserId={booking.ride.driverId}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <div className="sticky top-20 space-y-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {isPassenger ? "Your driver" : "Passenger"}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Avatar src={other.avatarUrl} name={other.name} size={56} />
                  <div>
                    <div className="font-semibold">{other.name}</div>
                    {isPassenger && booking.ride.driver.ratingCount > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {booking.ride.driver.ratingAvg.toFixed(1)} ·{" "}
                        {booking.ride.driver.ratingCount} reviews
                      </div>
                    )}
                  </div>
                </div>
                {other.phone && booking.status === "CONFIRMED" && (
                  <a href={`tel:+91${other.phone}`} className="block mt-4">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4" /> Call {other.name.split(" ")[0]}
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}

function BookingBadge({ status }: { status: string }) {
  const map: Record<string, any> = {
    PENDING: { variant: "warning", label: "Pending payment" },
    CONFIRMED: { variant: "success", label: "Confirmed" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    COMPLETED: { variant: "muted", label: "Completed" },
    REFUNDED: { variant: "muted", label: "Refunded" },
  };
  const m = map[status] ?? map.PENDING;
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
