import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import {
  Building2,
  ShieldCheck,
  Leaf,
  IndianRupee,
  Users,
  Heart,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About · RideBuddy",
  description:
    "RideBuddy is India's trusted carpooling community — connecting verified drivers and passengers to save money, cut traffic and reduce emissions.",
};

export default function AboutPage() {
  return (
    <div>
      <PageHero
        eyebrow="Our story"
        icon={Building2}
        title={
          <>
            Carpooling that India can <span className="text-brand-600">trust</span>
          </>
        }
        subtitle="We're on a mission to put the empty seats on India's roads to good use — making travel cheaper, greener and more human, one shared ride at a time."
      />

      {/* Stats */}
      <section className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "1M+", l: "Travellers" },
            { v: "120+", l: "Cities covered" },
            { v: "₹2,000", l: "Avg. saved per trip" },
            { v: "85kg", l: "CO₂ saved/trip" },
          ].map((s) => (
            <Card key={s.l} className="text-center">
              <CardContent className="py-6">
                <div className="text-3xl font-bold text-brand-600">{s.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="container py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Why we started</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Millions of cars travel India&apos;s highways every day with empty
            seats, while just as many people struggle to find an affordable,
            comfortable way to get where they&apos;re going. We built RideBuddy to
            close that gap.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            By verifying every member and handling payments, tracking and trust
            in one place, we make sharing a ride with a stranger feel as safe and
            simple as travelling with a friend.
          </p>
        </div>
        <Card className="overflow-hidden border-2 border-brand-200">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-8 text-white">
            <Heart className="h-8 w-8" />
            <p className="mt-4 text-lg font-semibold leading-snug">
              &ldquo;Every shared seat is one less car on the road, a few hundred
              rupees saved, and a new connection made.&rdquo;
            </p>
            <p className="mt-3 text-sm text-white/80">— The RideBuddy team</p>
          </div>
        </Card>
      </section>

      {/* Values */}
      <section className="bg-secondary/40 py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            What we stand for
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                t: "Safety first",
                d: "Aadhaar + license verification, live tracking and community ratings on every profile.",
              },
              {
                icon: IndianRupee,
                t: "Fair for everyone",
                d: "Direct between people — no commissions or hidden fees eating into your savings.",
              },
              {
                icon: Leaf,
                t: "Better for the planet",
                d: "Every full car means fewer emissions and less congestion on India's roads.",
              },
              {
                icon: Users,
                t: "Community-driven",
                d: "Real reviews and reputation keep RideBuddy welcoming and trustworthy.",
              },
              {
                icon: Heart,
                t: "Built with care",
                d: "Thoughtful design and support so every trip feels effortless.",
              },
              {
                icon: Building2,
                t: "Made for India",
                d: "From metros to small towns — designed around how India actually travels.",
              },
            ].map((v) => (
              <Card key={v.t}>
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{v.t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <Card className="border-2 border-brand-200">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">
              Join a million travellers
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Create your free account, verify once, and start sharing rides
              across India today.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/auth/signup">
                <Button variant="gradient" size="lg">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg">
                  How it works
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
