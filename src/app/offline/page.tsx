import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WifiOff, RefreshCcw } from "lucide-react";

export const metadata = {
  title: "You're offline · RideBuddy",
};

export default function OfflinePage() {
  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">You're offline</h1>
          <p className="mt-2 text-muted-foreground">
            RideBuddy needs an internet connection to find rides, book seats,
            and chat with drivers. Please reconnect and try again.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2">
            <Link href="/">
              <Button variant="gradient" className="w-full">
                <RefreshCcw className="h-4 w-4" /> Try again
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
