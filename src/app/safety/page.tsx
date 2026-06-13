import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/marketing/page-hero";
import {
  ShieldCheck,
  MapPin,
  Star,
  Lock,
  Phone,
  UserCheck,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Safety · RideBuddy",
  description:
    "Safety is at the heart of RideBuddy — ID verification, live tracking, secure payments, ratings and in-app support keep every trip protected.",
};

const pillars = [
  {
    icon: UserCheck,
    t: "Verified members",
    d: "Every driver and passenger verifies their identity with Aadhaar and a live selfie before they can ride.",
  },
  {
    icon: MapPin,
    t: "Live tracking",
    d: "Follow your trip in real time and share your live location with family and friends on every journey.",
  },
  {
    icon: Lock,
    t: "Secure payments",
    d: "Pay through Razorpay-protected UPI and cards. Money is only released to drivers after the trip.",
  },
  {
    icon: Star,
    t: "Ratings & reviews",
    d: "Two-way ratings after every ride keep the community accountable and surface the most trusted members.",
  },
  {
    icon: MessageSquare,
    t: "In-app chat",
    d: "Coordinate pickups without sharing your personal number — all messaging stays inside RideBuddy.",
  },
  {
    icon: Phone,
    t: "Support when you need it",
    d: "Our team is reachable in-app, and emergency contacts are always one tap away during a trip.",
  },
];

const passengerTips = [
  "Check the driver's rating, reviews and verification badge before booking.",
  "Share your live trip with a trusted contact from the tracking screen.",
  "Confirm the vehicle and plate number match the app before getting in.",
  "Keep all payments and chat inside the app — never pay cash outside RideBuddy.",
];

const driverTips = [
  "Keep your vehicle documents and KYC up to date and verified.",
  "Confirm passenger details and pickup point through in-app chat.",
  "Drive only when well-rested and follow all traffic rules.",
  "Report any uncomfortable behaviour — ratings keep everyone safe.",
];

export default function SafetyPage() {
  return (
    <div>
      <PageHero
        eyebrow="Trust & safety"
        icon={ShieldCheck}
        title={
          <>
            Your safety, <span className="text-brand-600">built in</span>
          </>
        }
        subtitle="From verified profiles to live tracking and protected payments, safety isn't an add-on — it's the foundation of every RideBuddy trip."
      />

      {/* Pillars */}
      <section className="container py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          How we protect every trip
        </h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <Card key={p.t} className="border-2 hover:border-brand-300 transition-colors">
              <CardContent className="p-6">
                <div className="h-11 w-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{p.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{p.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="bg-secondary/40 py-14">
        <div className="container grid md:grid-cols-2 gap-6">
          <TipCard title="Tips for passengers" tips={passengerTips} />
          <TipCard title="Tips for drivers" tips={driverTips} />
        </div>
      </section>

      {/* Emergency */}
      <section className="container py-14">
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">
                In an emergency, call 112
              </h3>
              <p className="mt-1.5 text-sm text-amber-800">
                If you ever feel unsafe during a trip, contact local emergency
                services on <strong>112</strong> immediately. You can also reach
                our support team in-app to report any issue — we investigate every
                report.
              </p>
              <Link href="/help" className="inline-block mt-4">
                <Button variant="outline" size="sm">
                  Visit Help Center
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TipCard({ title, tips }: { title: string; tips: string[] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg">{title}</h3>
        <ul className="mt-4 space-y-3">
          {tips.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
              <span className="text-foreground/90">{t}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
