import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, userIsDriver } from "@/lib/session";
import { PublishRideForm, type RideFormInitial } from "@/app/publish/form";
import { BackLink } from "@/components/ui/back-link";

export const dynamic = "force-dynamic";

// The publish form builds departure as a local wall-clock time; this product is
// India-focused, so derive the initial date/time in IST to round-trip cleanly.
const TZ = "Asia/Kolkata";

export default async function EditRidePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();
  if (!userIsDriver(user)) redirect(`/rides/${params.id}`);

  const [ride, vehicles] = await Promise.all([
    prisma.ride.findUnique({ where: { id: params.id } }),
    prisma.vehicle.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!ride) notFound();
  if (ride.driverId !== user.id) redirect(`/rides/${params.id}`);
  // Only upcoming rides can be edited.
  if (ride.status !== "SCHEDULED") redirect(`/rides/${params.id}`);

  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const initial: RideFormInitial = {
    from: {
      city: ride.fromCity,
      address: ride.fromAddress,
      lat: ride.fromLat,
      lng: ride.fromLng,
    },
    to: {
      city: ride.toCity,
      address: ride.toAddress,
      lat: ride.toLat,
      lng: ride.toLng,
    },
    vehicleId: ride.vehicleId ?? undefined,
    date: dateFmt.format(ride.departureTime),
    time: timeFmt.format(ride.departureTime),
    seats: ride.totalSeats,
    price: ride.pricePerSeat,
    description: ride.description ?? "",
    instantBooking: ride.instantBooking,
    womenOnly: ride.womenOnly,
    allowMusic: ride.allowMusic,
    allowSmoking: ride.allowSmoking,
    allowPets: ride.allowPets,
  };

  const bookedSeats = ride.totalSeats - ride.availableSeats;

  return (
    <div className="container max-w-3xl py-10">
      <BackLink href={`/rides/${ride.id}`}>Back to ride</BackLink>
      <h1 className="mt-4 text-3xl font-bold">Edit ride</h1>
      <p className="text-muted-foreground mt-1">
        Update your route, timing, price or preferences.
        {bookedSeats > 0 && (
          <>
            {" "}
            You already have{" "}
            <strong className="text-foreground">{bookedSeats}</strong> seat
            {bookedSeats === 1 ? "" : "s"} booked — total seats can&apos;t go
            below that.
          </>
        )}
      </p>
      <PublishRideForm vehicles={vehicles} rideId={ride.id} initial={initial} />
    </div>
  );
}
