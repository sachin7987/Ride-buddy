import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import { getSession } from "@/lib/session";
import {
  ShieldCheck,
  Search as SearchIcon,
  MapPin,
  Smartphone,
  PlusCircle,
  CalendarCheck,
  Wallet,
  Star,
  Route,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How it works · RideBuddy",
  description:
    "See how RideBuddy works for passengers and drivers — verify once, search or publish a ride, travel together and pay securely in-app.",
};

const passengerSteps = [
  {
    icon: ShieldCheck,
    title: "Verify your identity",
    text: "Sign up and upload your Aadhaar + a selfie. It takes about 2 minutes and keeps the whole community safe.",
  },
  {
    icon: SearchIcon,
    title: "Search your route",
    text: "Enter your pickup and drop, pick a date, and browse verified drivers heading the same way with live map matches.",
  },
  {
    icon: CalendarCheck,
    title: "Book your seat",
    text: "Pick a ride that fits your budget and timing, then book instantly or request approval from the driver.",
  },
  {
    icon: Star,
    title: "Travel & rate",
    text: "Track your driver live, chat in-app, pay securely, and rate the trip when you arrive.",
  },
];

const driverSteps = [
  {
    icon: ShieldCheck,
    title: "Verify & add your vehicle",
    text: "Complete KYC and add your car or bike with its papers. Verified drivers earn more trust and bookings.",
  },
  {
    icon: PlusCircle,
    title: "Publish your ride",
    text: "Set your route, departure time, number of seats and price per seat. Allow instant booking or approve manually.",
  },
  {
    icon: Route,
    title: "Pick up passengers",
    text: "Accept requests, chat to coordinate pickup points, and travel together along your usual route.",
  },
  {
    icon: Wallet,
    title: "Get paid",
    text: "Payments are collected securely up front and settled to you after each trip completes.",
  },
];

export const dynamic = "force-dynamic";

export default async function HowItWorksPage() {
  const session = await getSession();
  const loggedIn = Boolean(session?.user);
  return (
    <div>
      <PageHero
        eyebrow="How it works"
        icon={Smartphone}
        title={
          <>
            From sign-up to <span className="text-brand-600">arrival</span>
          </>
        }
        subtitle="Whether you're catching a ride or sharing your own, getting going on RideBuddy takes just a few simple steps."
      />

      {/* Passenger steps */}
      <section className="container py-14">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <SearchIcon className="h-3.5 w-3.5" /> For passengers
          </span>
        </div>
        <h2 className="mt-4 text-2xl md:text-3xl font-bold">Find & book a ride</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {passengerSteps.map((s, i) => (
            <StepCard key={s.title} index={i + 1} {...s} />
          ))}
        </div>
        <div className="mt-8">
          <Link href="/search">
            <Button variant="gradient" size="lg">
              <SearchIcon className="h-4 w-4" /> Find a ride
            </Button>
          </Link>
        </div>
      </section>

      {/* Driver steps */}
      <section className="bg-secondary/40 py-14">
        <div className="container">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 text-brand-700 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <PlusCircle className="h-3.5 w-3.5" /> For drivers
            </span>
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl font-bold">
            Publish & earn on your route
          </h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {driverSteps.map((s, i) => (
              <StepCard key={s.title} index={i + 1} {...s} />
            ))}
          </div>
          <div className="mt-8">
            <Link href="/publish">
              <Button variant="gradient" size="lg">
                <PlusCircle className="h-4 w-4" /> Publish a ride
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Ready to ride?</h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          {loggedIn
            ? "You're all set — find a ride heading your way or publish your own in seconds."
            : "Create your free account and complete verification once — then publish or book in seconds."}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          {loggedIn ? (
            <Link href="/search">
              <Button variant="gradient" size="lg">
                <SearchIcon className="h-4 w-4" /> Find a ride
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button variant="gradient" size="lg">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href="/safety">
            <Button variant="outline" size="lg">
              <ShieldCheck className="h-4 w-4" /> How we keep you safe
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  index,
  icon: Icon,
  title,
  text,
}: {
  index: number;
  icon: typeof MapPin;
  title: string;
  text: string;
}) {
  return (
    <Card className="relative border-2 hover:border-brand-300 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="h-11 w-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-3xl font-bold text-brand-200">{index}</span>
        </div>
        <h3 className="mt-4 font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
