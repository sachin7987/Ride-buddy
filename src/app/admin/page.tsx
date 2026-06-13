import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ApproveVehicleButtons } from "./approve-vehicle-buttons";
import { RecentDecisions, type DecisionUser } from "./recent-decisions";
import {
  PendingSubmissions,
  type PendingUser,
} from "./pending-submissions";
import { Car } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [pending, recentDecisions, stats, pendingVehicles] = await Promise.all([
    prisma.kycDocument.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Most recent reviewed documents — used to surface which users were
    // decided on lately. We then load each of those users' *full* document
    // set below so the grouped card can show pending vs approved at a glance.
    prisma.kycDocument.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      select: { userId: true, reviewedAt: true },
      orderBy: { reviewedAt: "desc" },
      take: 100,
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

  // Group pending documents by user so each person gets a single card.
  const pendingUsers: PendingUser[] = [];
  const pendingIndex = new Map<string, PendingUser>();
  for (const d of pending) {
    let bucket = pendingIndex.get(d.user.id);
    if (!bucket) {
      bucket = {
        id: d.user.id,
        name: d.user.name,
        email: d.user.email,
        avatarUrl: d.user.avatarUrl,
        docs: [],
      };
      pendingIndex.set(d.user.id, bucket);
      pendingUsers.push(bucket);
    }
    bucket.docs.push({
      id: d.id,
      type: d.type,
      number: d.number,
      fileUrl: d.fileUrl,
    });
  }

  // Distinct users with a recent decision, newest decision first (the query is
  // already ordered by reviewedAt desc, so first-seen == most recent).
  const decisionUserIds: string[] = [];
  const lastDecisionByUser = new Map<string, Date | null>();
  for (const d of recentDecisions) {
    if (!lastDecisionByUser.has(d.userId)) {
      decisionUserIds.push(d.userId);
      lastDecisionByUser.set(d.userId, d.reviewedAt);
    }
  }
  const topUserIds = decisionUserIds.slice(0, 12);

  const decisionUserRecords = topUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: topUserIds } },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          kycStatus: true,
          kycDocuments: {
            select: {
              id: true,
              type: true,
              status: true,
              reviewedAt: true,
              createdAt: true,
              number: true,
              fileUrl: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : [];

  // Preserve the most-recent-decision ordering and serialize dates for the
  // client component.
  const recordById = new Map(decisionUserRecords.map((u) => [u.id, u]));
  const decisionUsers: DecisionUser[] = topUserIds
    .map((id) => recordById.get(id))
    .filter((u): u is NonNullable<typeof u> => Boolean(u))
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      kycStatus: u.kycStatus,
      lastDecisionAt: lastDecisionByUser.get(u.id)?.toISOString() ?? null,
      docs: u.kycDocuments.map((d) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        reviewedAt: d.reviewedAt ? d.reviewedAt.toISOString() : null,
        createdAt: d.createdAt.toISOString(),
        number: d.number,
        fileUrl: d.fileUrl,
      })),
    }));

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
      {pendingUsers.length > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          Grouped by user — tap a card to review and approve their documents.
        </p>
      )}
      <PendingSubmissions users={pendingUsers} />

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
      <p className="mt-1 text-sm text-muted-foreground">
        Grouped by user — tap a card to see each document&apos;s status.
      </p>
      <RecentDecisions users={decisionUsers} />
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
