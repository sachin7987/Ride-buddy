import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Sparkles } from "lucide-react";

/**
 * Friendly card shown when a PASSENGER-only user lands on a driver-only route.
 * Lets them upgrade to a driver account in one click via /profile?becomeDriver=1.
 */
export function DriverOnlyGate({ feature }: { feature: string }) {
  return (
    <div className="container max-w-xl py-16">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
            <Car className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">For drivers only</h2>
          <p className="mt-2 text-muted-foreground">
            {feature} is available to driver accounts. You're currently
            registered as a passenger.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/profile?becomeDriver=1">
              <Button variant="gradient" className="w-full">
                <Sparkles className="h-4 w-4" /> Become a driver
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full">
                Find a ride instead
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Becoming a driver is free. You can always switch back.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
