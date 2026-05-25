import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, userIsDriver } from "@/lib/session";
import { PublishRideForm } from "./form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DriverOnlyGate } from "@/components/role-gate";
import { ShieldAlert, Car } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const user = await requireUser();
  if (!userIsDriver(user)) {
    return <DriverOnlyGate feature="Publishing rides" />;
  }
  const [vehicles, dbUser] = await Promise.all([
    prisma.vehicle.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { kycStatus: true } }),
  ]);

  if (dbUser?.kycStatus !== "VERIFIED") {
    return (
      <div className="container max-w-xl py-16">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Verification required</h2>
            <p className="mt-2 text-muted-foreground">
              Drivers must be ID-verified before publishing rides. It takes about 2 minutes.
            </p>
            <Link href="/kyc" className="block mt-6">
              <Button variant="gradient">Verify my identity</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="container max-w-xl py-16">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
              <Car className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Add a vehicle first</h2>
            <p className="mt-2 text-muted-foreground">
              You'll need to register at least one vehicle to publish rides.
            </p>
            <Link href="/vehicles/new" className="block mt-6">
              <Button variant="gradient">Add vehicle</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Publish a ride</h1>
      <p className="text-muted-foreground mt-1">
        Tell us where you're heading and we'll match you with passengers.
      </p>
      <PublishRideForm vehicles={vehicles} />
    </div>
  );
}
