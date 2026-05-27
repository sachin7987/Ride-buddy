import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/ui/back-link";
import { Map } from "@/components/map-loader";
import { formatINR, formatDate, formatTime } from "@/lib/utils";
import {
  ShieldCheck,
  Star,
  ArrowRight,
  Clock,
  MapPin,
  Users,
  Music,
  Cigarette,
  PawPrint,
  Sparkles,
} from "lucide-react";
import { BookingPanel } from "./booking-panel";
import { RideStatusPill } from "@/components/ride/lifecycle-actions";

export const dynamic = "force-dynamic";

export default async function RideDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
          ratingAvg: true,
          ratingCount: true,
          kycStatus: true,
          createdAt: true,
        },
      },
      vehicle: true,
      _count: { select: { bookings: { where: { status: { in: ["CONFIRMED", "PENDING"] } } } } },
    },
  });
  if (!ride) notFound();

  const session = await getSession();
  const isDriver = session?.user?.id === ride.driverId;

  return (
    <div className="container max-w-5xl py-8">
      <BackLink href="/search">Back to search</BackLink>

      <div className="mt-4 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Route card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {formatDate(ride.departureTime)}
                    <RideStatusPill status={ride.status} />
                  </div>
                  <h1 className="text-2xl font-bold mt-1 flex items-center gap-2">
                    {ride.fromCity} <ArrowRight className="h-5 w-5" /> {ride.toCity}
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-brand-600">
                    {formatINR(ride.pricePerSeat)}
                  </div>
                  <div className="text-xs text-muted-foreground">per seat</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4">
                <div className="flex flex-col items-center pt-2">
                  <span className="h-3 w-3 rounded-full bg-brand-500 ring-4 ring-brand-100 shrink-0" />
                  <span className="my-1 w-0.5 flex-1 min-h-[1.5rem] bg-border" />
                  <span className="h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-100 shrink-0" />
                </div>
                <div className="space-y-4 min-w-0">
                  <div>
                    <div className="text-sm text-muted-foreground">Pickup</div>
                    <div className="font-medium break-words">{ride.fromAddress}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Departs at {formatTime(ride.departureTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Drop</div>
                    <div className="font-medium break-words">{ride.toAddress}</div>
                    {ride.durationMin && (
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />~{Math.floor(ride.durationMin / 60)}h{" "}
                        {ride.durationMin % 60}min · {ride.distanceKm} km
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Map
                  from={{ lat: ride.fromLat, lng: ride.fromLng }}
                  to={{ lat: ride.toLat, lng: ride.toLng }}
                  height={280}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {ride.instantBooking && (
                  <Badge variant="success">
                    <Sparkles className="h-3 w-3 mr-1" /> Instant booking
                  </Badge>
                )}
                {ride.womenOnly && <Badge>Women only</Badge>}
                {ride.allowMusic && (
                  <Badge variant="muted">
                    <Music className="h-3 w-3 mr-1" /> Music ok
                  </Badge>
                )}
                {ride.allowSmoking && (
                  <Badge variant="muted">
                    <Cigarette className="h-3 w-3 mr-1" /> Smoking ok
                  </Badge>
                )}
                {ride.allowPets && (
                  <Badge variant="muted">
                    <PawPrint className="h-3 w-3 mr-1" /> Pets ok
                  </Badge>
                )}
              </div>

              {ride.description && (
                <div className="mt-5 rounded-lg bg-muted/50 p-4 text-sm">
                  <div className="font-medium mb-1">From the driver</div>
                  <p className="text-muted-foreground">{ride.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Driver card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">About the driver</h3>
              <Link
                href={`/users/${ride.driver.id}`}
                className="flex items-center gap-4"
              >
                <Avatar src={ride.driver.avatarUrl} name={ride.driver.name} size={56} />
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    {ride.driver.name}
                    {ride.driver.kycStatus === "VERIFIED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  {ride.driver.ratingCount > 0 ? (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {ride.driver.ratingAvg.toFixed(1)} · {ride.driver.ratingCount} reviews
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">New driver</div>
                  )}
                  {ride.driver.bio && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {ride.driver.bio}
                    </p>
                  )}
                </div>
              </Link>

              {ride.vehicle && (
                <div className="mt-5 pt-5 border-t flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Vehicle</div>
                    <div className="font-medium">
                      {ride.vehicle.make} {ride.vehicle.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ride.vehicle.year} · {ride.vehicle.color} ·{" "}
                      <span className="font-mono">{ride.vehicle.plateNumber}</span>
                    </div>
                  </div>
                  <Badge variant="muted">{ride.vehicle.type}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="sticky top-20">
            {isDriver ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground text-center">
                    This is your ride.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <div className="text-xs text-muted-foreground">Booked</div>
                      <div className="text-lg font-semibold">
                        {ride.totalSeats - ride.availableSeats}/{ride.totalSeats}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <div className="text-xs text-muted-foreground">Pending</div>
                      <div className="text-lg font-semibold">
                        {ride._count.bookings -
                          (ride.totalSeats - ride.availableSeats)}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/rides/${ride.id}/bookings`}
                    className="block mt-4"
                  >
                    <Button variant="gradient" className="w-full">
                      View ride bookings
                    </Button>
                  </Link>
                  {(ride.status === "SCHEDULED" ||
                    ride.status === "IN_PROGRESS") && (
                    <Link
                      href={`/rides/${ride.id}/track`}
                      className="block mt-2"
                    >
                      <Button variant="outline" className="w-full">
                        {ride.status === "IN_PROGRESS"
                          ? "Open live tracker"
                          : "Open tracker"}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : ride.status !== "SCHEDULED" ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-semibold">
                    {ride.status === "IN_PROGRESS"
                      ? "This ride has already started"
                      : ride.status === "COMPLETED"
                      ? "This ride has been completed"
                      : "This ride was cancelled"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bookings are no longer being accepted.
                  </p>
                  <Link href="/search" className="inline-block mt-4">
                    <Button variant="outline">Find another ride</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <BookingPanel
                rideId={ride.id}
                pricePerSeat={ride.pricePerSeat}
                availableSeats={ride.availableSeats}
                instantBooking={ride.instantBooking}
                isAuthenticated={!!session?.user}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
