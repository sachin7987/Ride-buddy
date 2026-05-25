import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicUserPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { fromUser: { select: { name: true, avatarUrl: true } } },
      },
      vehicles: { take: 5 },
    },
  });
  if (!user) notFound();

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar src={user.avatarUrl} name={user.name} size={96} />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold flex items-center gap-2 justify-center sm:justify-start">
                {user.name}
                {user.kycStatus === "VERIFIED" && (
                  <Badge variant="success">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </h1>
              {user.ratingCount > 0 && (
                <div className="mt-1 flex items-center gap-1 text-sm justify-center sm:justify-start">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{user.ratingAvg.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    · {user.ratingCount} review{user.ratingCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(user.createdAt)}
              </div>
              {user.bio && <p className="mt-3 text-sm">{user.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {user.vehicles.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Vehicles</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {user.vehicles.map((v) => (
                <div key={v.id} className="rounded-lg border p-3">
                  <div className="font-medium">
                    {v.make} {v.model}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {v.year} • {v.color} • {v.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user.reviewsReceived.length > 0 && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Reviews</h3>
            <div className="space-y-3">
              {user.reviewsReceived.map((r) => (
                <div key={r.id} className="rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Avatar src={r.fromUser.avatarUrl} name={r.fromUser.name} size={28} />
                    <span className="font-medium text-sm">{r.fromUser.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-0.5">
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
                  {r.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
