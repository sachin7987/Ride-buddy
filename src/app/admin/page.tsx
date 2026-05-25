import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ApproveButtons } from "./approve-buttons";
import { ApproveVehicleButtons } from "./approve-vehicle-buttons";
import { formatDate } from "@/lib/utils";
import { Car } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [pending, recent, stats, pendingVehicles] = await Promise.all([
    prisma.kycDocument.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.kycDocument.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { user: { select: { name: true } } },
      orderBy: { reviewedAt: "desc" },
      take: 10,
    }),
    prisma.user.groupBy({
      by: ["kycStatus"],
      _count: true,
    }),
    prisma.vehicle.findMany({
      where: {
        isVerified: false,
        AND: [{ rcUrl: { not: null } }, { insuranceUrl: { not: null } }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const stat = (s: string) => stats.find((x) => x.kycStatus === s)?._count ?? 0;

  return (
    <div className="container max-w-5xl py-10">
      <h1 className="text-3xl font-bold">Admin · KYC review</h1>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Verified" value={stat("VERIFIED")} color="text-emerald-600" />
        <StatCard label="Pending" value={stat("PENDING")} color="text-amber-600" />
        <StatCard label="Rejected" value={stat("REJECTED")} color="text-rose-600" />
        <StatCard label="Unverified" value={stat("UNVERIFIED")} color="text-muted-foreground" />
      </div>

      <h2 className="mt-8 text-xl font-semibold">Pending submissions</h2>
      {pending.length === 0 ? (
        <Card className="mt-3">
          <CardContent className="p-8 text-center text-muted-foreground">
            All caught up. No pending documents.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-3 space-y-3">
          {pending.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Avatar src={d.user.avatarUrl} name={d.user.name} size={40} />
                    <div>
                      <div className="font-medium">{d.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.user.email}
                      </div>
                    </div>
                  </div>
                  <Badge>{d.type.replace("_", " ")}</Badge>
                </div>
                {d.number && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Document number: </span>
                    <span className="font-mono">{d.number}</span>
                  </p>
                )}
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.fileUrl}
                    alt="document"
                    className="max-h-64 rounded-lg border bg-muted object-contain"
                  />
                </a>
                <ApproveButtons id={d.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-xl font-semibold flex items-center gap-2">
        <Car className="h-5 w-5" /> Vehicle verification queue
      </h2>
      {pendingVehicles.length === 0 ? (
        <Card className="mt-3">
          <CardContent className="p-6 text-center text-muted-foreground">
            No vehicles waiting for review.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-3 space-y-3">
          {pendingVehicles.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Avatar src={v.owner.avatarUrl} name={v.owner.name} size={40} />
                    <div>
                      <div className="font-medium">{v.owner.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {v.owner.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {v.make} {v.model}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {v.year} · {v.color} ·{" "}
                      <span className="font-mono">{v.plateNumber}</span> · {v.type}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <DocPreview title="Registration Certificate" url={v.rcUrl!} />
                  <DocPreview title="Insurance" url={v.insuranceUrl!} />
                  <DocPreview title="Vehicle photo" url={v.photoUrl} optional />
                </div>

                <ApproveVehicleButtons id={v.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-xl font-semibold">Recent decisions</h2>
      <div className="mt-3 space-y-2">
        {recent.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm"
          >
            <span>
              {d.user.name} · {d.type.replace("_", " ")}
            </span>
            <span className="flex items-center gap-2">
              <Badge variant={d.status === "APPROVED" ? "success" : "destructive"}>
                {d.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {d.reviewedAt && formatDate(d.reviewedAt)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocPreview({
  title,
  url,
  optional,
}: {
  title: string;
  url: string | null;
  optional?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="aspect-[4/3] bg-muted/30 relative flex items-center justify-center">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <a href={url} target="_blank" rel="noreferrer">
            <img
              src={url}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">
            {optional ? "Not uploaded" : "Missing"}
          </span>
        )}
      </div>
      <div className="px-3 py-2 text-xs font-medium">{title}</div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
