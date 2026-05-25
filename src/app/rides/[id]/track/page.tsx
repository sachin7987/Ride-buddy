import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, userIsDriver } from "@/lib/session";
import { DriverOnlyGate } from "@/components/role-gate";
import { Card, CardContent } from "@/components/ui/card";
import { LiveMap } from "@/components/live-map";
import {
  RideLifecycleActions,
  RideStatusPill,
} from "@/components/ride/lifecycle-actions";
import { ArrowRight, ArrowLeft, Users } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TrackPage({
  params,
}: {
  params: { id: string };
}) {
  const me = await requireUser();
  if (!userIsDriver(me)) {
    return <DriverOnlyGate feature="Live trip tracking" />;
  }
  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { bookings: { where: { status: { in: ["CONFIRMED", "COMPLETED"] } } } },
      },
    },
  });
  if (!ride) notFound();
  const isDriver = ride.driverId === me.id;
  if (!isDriver) notFound();

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href={`/rides/${ride.id}/bookings`}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to ride bookings
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Live trip</h1>
          <p className="text-muted-foreground mt-1">
            Share your location with passengers throughout the trip.
          </p>
        </div>
        <RideStatusPill status={ride.status} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm text-muted-foreground">
                {formatDate(ride.departureTime)} · {formatTime(ride.departureTime)}
              </div>
              <h2 className="mt-1 text-xl font-semibold flex items-center gap-2">
                {ride.fromCity}
                <ArrowRight className="h-4 w-4" />
                {ride.toCity}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
              <Users className="h-3 w-3" />
              {ride._count.bookings} confirmed passenger
              {ride._count.bookings !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Lifecycle controls */}
          <div className="mt-5 pt-5 border-t">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              Trip controls
            </p>
            <RideLifecycleActions rideId={ride.id} status={ride.status} />
          </div>

          <div className="mt-6">
            <LiveMap
              rideId={ride.id}
              from={{ lat: ride.fromLat, lng: ride.fromLng }}
              to={{ lat: ride.toLat, lng: ride.toLng }}
              amDriver
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
