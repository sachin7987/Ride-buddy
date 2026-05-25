import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, userIsDriver, userIsPassenger } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileEdit } from "./edit-form";
import { formatINR } from "@/lib/utils";
import { Star, ShieldCheck, Car, MapPin, IndianRupee } from "lucide-react";
import { roleLabel } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const me = await requireUser();
  const [user, vehicleCount, asPassengerCount, asDriverCount, paidAgg] = await Promise.all([
    prisma.user.findUnique({
      where: { id: me.id },
      include: {
        reviewsReceived: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { fromUser: { select: { name: true, avatarUrl: true } } },
        },
      },
    }),
    prisma.vehicle.count({ where: { ownerId: me.id } }),
    prisma.booking.count({ where: { passengerId: me.id, status: { in: ["CONFIRMED", "COMPLETED"] } } }),
    prisma.ride.count({ where: { driverId: me.id } }),
    prisma.payment.aggregate({
      where: { userId: me.id, status: "PAID" },
      _sum: { amount: true },
    }),
  ]);
  if (!user) return null;

  return (
    <div className="container max-w-4xl py-10">
      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                size={96}
                className="mx-auto"
              />
              <h2 className="mt-4 font-bold text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.kycStatus === "VERIFIED" && (
                <Badge variant="success" className="mt-2">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                </Badge>
              )}
              {user.ratingCount > 0 && (
                <div className="mt-3 flex items-center justify-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{user.ratingAvg.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    · {user.ratingCount} review{user.ratingCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pb-1 border-b">
                {roleLabel(user.role)}
              </div>
              {userIsDriver(user) && (
                <>
                  <Stat
                    icon={Car}
                    label="Vehicles"
                    value={String(vehicleCount)}
                    link="/vehicles"
                  />
                  <Stat
                    icon={ShieldCheck}
                    label="Rides published"
                    value={String(asDriverCount)}
                  />
                </>
              )}
              {userIsPassenger(user) && (
                <>
                  <Stat
                    icon={MapPin}
                    label="Trips taken"
                    value={String(asPassengerCount)}
                  />
                  <Stat
                    icon={IndianRupee}
                    label="Total spent"
                    value={formatINR(paidAgg._sum.amount ?? 0)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Edit profile</h3>
              <ProfileEdit
                user={{
                  name: user.name,
                  bio: user.bio ?? "",
                  avatarUrl: user.avatarUrl ?? "",
                  role: user.role as "PASSENGER" | "DRIVER" | "BOTH",
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Recent reviews</h3>
              {user.reviewsReceived.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {user.reviewsReceived.map((r) => (
                    <div key={r.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={r.fromUser.avatarUrl} name={r.fromUser.name} size={28} />
                        <span className="font-medium text-sm">{r.fromUser.name}</span>
                        <div className="ml-auto flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < r.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  link,
}: {
  icon: any;
  label: string;
  value: string;
  link?: string;
}) {
  const inner = (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
  return link ? (
    <Link href={link} className="block hover:opacity-70">
      {inner}
    </Link>
  ) : (
    inner
  );
}
