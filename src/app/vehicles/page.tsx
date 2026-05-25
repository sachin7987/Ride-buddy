import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty";
import {
  Car,
  Bike,
  Plus,
  Pencil,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";
import { DeleteVehicleButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const user = await requireUser();
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My vehicles</h1>
          <p className="text-muted-foreground mt-1">
            Add the vehicles you'll use to share rides.
          </p>
        </div>
        <Link href="/vehicles/new">
          <Button variant="gradient">
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="Add your first vehicle to start publishing rides."
          action={
            <Link href="/vehicles/new">
              <Button variant="gradient">
                <Plus className="h-4 w-4" /> Add vehicle
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const docsUploaded = !!v.rcUrl && !!v.insuranceUrl;
            const status = v.isVerified
              ? "verified"
              : docsUploaded
              ? "pending"
              : "incomplete";
            return (
              <Card key={v.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {v.photoUrl ? (
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={v.photoUrl}
                            alt={`${v.make} ${v.model}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                          {v.type === "BIKE" ? (
                            <Bike className="h-6 w-6" />
                          ) : (
                            <Car className="h-6 w-6" />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {v.make} {v.model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {v.year} • {v.color}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2.5 py-1 font-mono">
                      {v.plateNumber}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1">
                      {v.seats} seats
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1">{v.type}</span>
                  </div>

                  {status === "incomplete" && (
                    <Link href={`/vehicles/${v.id}/edit`} className="block mt-4">
                      <Button variant="gradient" size="sm" className="w-full">
                        <ShieldCheck className="h-4 w-4" />
                        Verify vehicle
                      </Button>
                    </Link>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t">
                    <Link href={`/vehicles/${v.id}/edit`}>
                      <Button size="sm" variant="ghost">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteVehicleButton id={v.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "verified")
    return (
      <Badge variant="success" className="shrink-0">
        <ShieldCheck className="h-3 w-3 mr-1" /> Verified
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge variant="warning" className="shrink-0">
        <Clock className="h-3 w-3 mr-1" /> Reviewing
      </Badge>
    );
  return (
    <Badge variant="muted" className="shrink-0">
      <AlertCircle className="h-3 w-3 mr-1" /> Verify
    </Badge>
  );
}
