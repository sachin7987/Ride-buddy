import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, Clock } from "lucide-react";
import { EditVehicleForm } from "./edit-form";
import { VehicleDocuments } from "./documents";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({
  params,
}: {
  params: { id: string };
}) {
  const me = await requireUser();
  const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
  if (!vehicle || vehicle.ownerId !== me.id) notFound();

  const docsUploaded = !!vehicle.rcUrl && !!vehicle.insuranceUrl;
  const verifyState = vehicle.isVerified
    ? "verified"
    : docsUploaded
    ? "pending"
    : "incomplete";

  return (
    <div className="container max-w-3xl py-8">
      <Link
        href="/vehicles"
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to my vehicles
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Edit vehicle</h1>
          <p className="text-muted-foreground mt-1">
            Update details and submit documents for verification.
          </p>
        </div>
        <StatusPill state={verifyState} />
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Vehicle details</h3>
          <EditVehicleForm vehicle={vehicle} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
              <h3 className="font-semibold">Documents & verification</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Upload your Registration Certificate (RC) and Insurance to get a
                "Verified" badge on your vehicle.
              </p>
            </div>
          </div>
          <VehicleDocuments vehicle={vehicle} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatusPill({ state }: { state: string }) {
  if (state === "verified")
    return (
      <Badge variant="success" className="text-xs px-3 py-1.5">
        <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified vehicle
      </Badge>
    );
  if (state === "pending")
    return (
      <Badge variant="warning" className="text-xs px-3 py-1.5">
        <Clock className="h-3.5 w-3.5 mr-1" /> Documents under review
      </Badge>
    );
  return (
    <Badge variant="muted" className="text-xs px-3 py-1.5">
      Verification incomplete
    </Badge>
  );
}
