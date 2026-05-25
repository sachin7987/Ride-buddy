import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-3 text-2xl font-semibold">Lost on the road?</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn't find the page you're looking for.
      </p>
      <Link href="/" className="inline-block mt-6">
        <Button variant="gradient">Take me home</Button>
      </Link>
    </div>
  );
}
