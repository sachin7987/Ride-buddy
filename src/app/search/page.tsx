import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyRideResults } from "@/components/search/empty-ride-results";
import { formatINR, formatTime, formatDate } from "@/lib/utils";
import { SearchHeader } from "./search-header";
import {
  ShieldCheck,
  Star,
  Users,
  ArrowRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>> | Record<string, string | undefined>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await Promise.resolve(searchParams);
  const fromCity = sp.from;
  const toCity = sp.to;
  const date = sp.date;
  const seatsParam = parseInt(sp.seats || "1", 10);

  const where: any = {
    status: "SCHEDULED",
    availableSeats: { gte: seatsParam },
    departureTime: { gte: new Date() },
  };
  if (fromCity) where.fromCity = { contains: fromCity };
  if (toCity) where.toCity = { contains: toCity };
  if (date) {
    const d = new Date(date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.departureTime = { gte: d, lt: next };
  }

  const rides = await prisma.ride.findMany({
    where,
    include: {
      driver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          ratingAvg: true,
          ratingCount: true,
          kycStatus: true,
        },
      },
      vehicle: { select: { type: true, make: true, model: true } },
    },
    orderBy: { departureTime: "asc" },
    take: 50,
  });

  return (
    <div>
      <div className="bg-secondary/40 border-b">
        <div className="container py-6">
          <SearchHeader />
        </div>
      </div>

      <div className="container py-8">
        <div className="flex items-baseline justify-between gap-4 mb-5 flex-wrap">
          <div>
            {fromCity && toCity ? (
              <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
                <span>{fromCity}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <span>{toCity}</span>
              </h1>
            ) : (
              <h1 className="text-2xl font-bold">All upcoming rides</h1>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {date && `${formatDate(new Date(date))} · `}
              {rides.length} ride{rides.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {rides.length === 0 ? (
          <EmptyRideResults fromCity={fromCity} toCity={toCity} date={date} />
        ) : (
          <div className="space-y-4">
            {rides.map((r) => (
              <Link key={r.id} href={`/rides/${r.id}`} className="block">
                <Card className="hover:shadow-md hover:border-brand-300 transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <div className="text-center shrink-0">
                          <div className="text-base sm:text-lg font-semibold leading-tight">
                            {formatTime(r.departureTime)}
                          </div>
                          <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                            {formatDate(r.departureTime)}
                          </div>
                        </div>

                        <div className="flex flex-col items-center pt-1.5 shrink-0">
                          <span className="h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100" />
                          <span className="my-1 h-8 w-0.5 bg-border" />
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold truncate">{r.fromCity}</div>
                          <div className="text-xs text-muted-foreground truncate mb-2">
                            {r.fromAddress}
                          </div>
                          <div className="font-semibold truncate">{r.toCity}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {r.toAddress}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xl sm:text-2xl font-bold text-brand-600 leading-tight">
                          {formatINR(r.pricePerSeat)}
                        </div>
                        <div className="text-[11px] sm:text-xs text-muted-foreground">
                          per seat
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={r.driver.avatarUrl} name={r.driver.name} size={36} />
                        <div>
                          <div className="text-sm font-medium flex items-center gap-1.5">
                            {r.driver.name}
                            {r.driver.kycStatus === "VERIFIED" && (
                              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                            )}
                          </div>
                          {r.driver.ratingCount > 0 ? (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {r.driver.ratingAvg.toFixed(1)} • {r.driver.ratingCount} reviews
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground">New driver</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {r.vehicle && (
                          <Badge variant="muted">
                            {r.vehicle.type} · {r.vehicle.make} {r.vehicle.model}
                          </Badge>
                        )}
                        <Badge variant="muted">
                          <Users className="h-3 w-3 mr-1" />
                          {r.availableSeats} seats left
                        </Badge>
                        {r.womenOnly && <Badge variant="default">Women only</Badge>}
                        {r.instantBooking && (
                          <Badge variant="success">
                            <Clock className="h-3 w-3 mr-1" /> Instant
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
