import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, userIsDriver } from "@/lib/session";
import { DriverOnlyGate } from "@/components/role-gate";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import {
  RideLifecycleActions,
  RideStatusPill,
} from "@/components/ride/lifecycle-actions";
import { formatINR, formatDate, formatTime } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  MessageSquare,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RideBookingsPage({
  params,
}: {
  params: { id: string };
}) {
  const me = await requireUser();
  if (!userIsDriver(me)) {
    return <DriverOnlyGate feature="Ride bookings management" />;
  }
  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: {
      vehicle: true,
      bookings: {
        include: {
          passenger: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
              ratingAvg: true,
              ratingCount: true,
              kycStatus: true,
            },
          },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!ride || ride.driverId !== me.id) notFound();

  const confirmed = ride.bookings.filter((b) => b.status === "CONFIRMED");
  const pending = ride.bookings.filter((b) => b.status === "PENDING");
  const cancelled = ride.bookings.filter((b) => b.status === "CANCELLED");
  const seatsSold = confirmed.reduce((acc, b) => acc + b.seats, 0);
  const earnings = ride.bookings
    .filter((b) => b.payment?.status === "PAID")
    .reduce((acc, b) => acc + b.totalAmount, 0);

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href={`/rides/${ride.id}`}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to ride
      </Link>

      {/* Ride header */}
      <Card className="mt-3">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(ride.departureTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(ride.departureTime)}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold flex items-center gap-2">
                {ride.fromCity} <ArrowRight className="h-5 w-5" /> {ride.toCity}
              </h1>
              {ride.vehicle && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {ride.vehicle.make} {ride.vehicle.model} ·{" "}
                  <span className="font-mono">{ride.vehicle.plateNumber}</span>
                </div>
              )}
            </div>
            <RideStatusPill status={ride.status} />
          </div>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat
              icon={Users}
              label="Seats sold"
              value={`${seatsSold}/${ride.totalSeats}`}
            />
            <Stat
              icon={Users}
              label="Available"
              value={String(ride.availableSeats)}
            />
            <Stat
              icon={MessageSquare}
              label="Pending"
              value={String(pending.length)}
            />
            <Stat
              icon={IndianRupee}
              label="Earnings"
              value={formatINR(earnings)}
            />
          </div>

          {/* Lifecycle controls */}
          <div className="mt-5 pt-5 border-t">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
              Ride controls
            </p>
            <RideLifecycleActions rideId={ride.id} status={ride.status} />
            <div className="mt-4 flex flex-wrap gap-2">
              {(ride.status === "SCHEDULED" || ride.status === "IN_PROGRESS") && (
                <Link href={`/rides/${ride.id}/track`}>
                  <Button variant="outline" size="sm">
                    Open tracker
                  </Button>
                </Link>
              )}
              <Link href={`/rides/${ride.id}`}>
                <Button variant="ghost" size="sm">
                  View public ride page
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending requests */}
      {pending.length > 0 && (
        <Section
          title="Pending requests"
          subtitle="Confirm or decline these passengers."
          accent="amber"
        >
          {pending.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              isPending
            />
          ))}
        </Section>
      )}

      {/* Confirmed passengers */}
      <Section
        title={`Confirmed passengers (${confirmed.length})`}
        subtitle={
          confirmed.length === 0
            ? undefined
            : "These passengers will travel with you."
        }
      >
        {confirmed.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No bookings yet"
            description="Once passengers book and pay, they'll show up here."
          />
        ) : (
          confirmed.map((b) => <BookingRow key={b.id} booking={b} />)
        )}
      </Section>

      {/* Cancelled */}
      {cancelled.length > 0 && (
        <Section
          title={`Cancelled (${cancelled.length})`}
          subtitle="These bookings were cancelled."
          muted
        >
          {cancelled.map((b) => (
            <BookingRow key={b.id} booking={b} muted />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
  accent,
  muted,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: "amber";
  muted?: boolean;
}) {
  return (
    <section className="mt-6">
      <div
        className={
          accent === "amber"
            ? "rounded-t-xl border border-amber-200 bg-amber-50 px-4 py-2"
            : "px-1"
        }
      >
        <h2
          className={
            "font-semibold " +
            (accent === "amber"
              ? "text-amber-900"
              : muted
              ? "text-muted-foreground"
              : "")
          }
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={
              "text-xs mt-0.5 " +
              (accent === "amber" ? "text-amber-800" : "text-muted-foreground")
            }
          >
            {subtitle}
          </p>
        )}
      </div>
      <div
        className={
          accent === "amber"
            ? "rounded-b-xl border border-t-0 border-amber-200 bg-amber-50/30 p-3 space-y-2"
            : "mt-2 space-y-2"
        }
      >
        {children}
      </div>
    </section>
  );
}

function BookingRow({
  booking,
  isPending,
  muted,
}: {
  booking: any;
  isPending?: boolean;
  muted?: boolean;
}) {
  return (
    <Card className={muted ? "opacity-70" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <Link
            href={`/users/${booking.passenger.id}`}
            className="flex items-center gap-3 min-w-0"
          >
            <Avatar
              src={booking.passenger.avatarUrl}
              name={booking.passenger.name}
              size={44}
            />
            <div className="min-w-0">
              <div className="font-semibold flex items-center gap-1.5 truncate">
                {booking.passenger.name}
                {booking.passenger.kycStatus === "VERIFIED" && (
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                )}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {booking.passenger.email}
                {booking.passenger.ratingCount > 0 && (
                  <span className="ml-2">
                    ★ {booking.passenger.ratingAvg.toFixed(1)} ·{" "}
                    {booking.passenger.ratingCount}
                  </span>
                )}
              </div>
            </div>
          </Link>

          <div className="text-right shrink-0">
            <div className="text-sm">
              <span className="font-semibold">{booking.seats}</span>
              <span className="text-muted-foreground"> seat{booking.seats > 1 ? "s" : ""}</span>
            </div>
            <div className="text-sm font-semibold text-brand-700">
              {formatINR(booking.totalAmount)}
            </div>
            <PaymentBadge
              status={booking.payment?.status ?? null}
              bookingStatus={booking.status}
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
          <Link href={`/bookings/${booking.id}`}>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-3.5 w-3.5" /> Open booking
            </Button>
          </Link>
          {booking.passenger.phone && booking.status === "CONFIRMED" && (
            <a href={`tel:+91${booking.passenger.phone}`}>
              <Button variant="ghost" size="sm">
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
            </a>
          )}
          {isPending && (
            <span className="ml-auto text-xs text-amber-800">
              Waiting for payment confirmation
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentBadge({
  status,
  bookingStatus,
}: {
  status: string | null;
  bookingStatus: string;
}) {
  if (bookingStatus === "CANCELLED")
    return (
      <Badge variant="destructive" className="mt-1">
        Cancelled
      </Badge>
    );
  if (status === "PAID")
    return (
      <Badge variant="success" className="mt-1">
        Paid
      </Badge>
    );
  if (status === "FAILED")
    return (
      <Badge variant="destructive" className="mt-1">
        Failed
      </Badge>
    );
  return (
    <Badge variant="warning" className="mt-1">
      Awaiting payment
    </Badge>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}
