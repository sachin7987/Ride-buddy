import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";
import {
  LifeBuoy,
  Mail,
  Phone,
  ShieldCheck,
  ChevronDown,
  Search as SearchIcon,
  PlusCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center · RideBuddy",
  description:
    "Find answers to common questions about booking rides, publishing trips, verification, payments and safety on RideBuddy.",
};

const faqs: { q: string; a: string }[] = [
  {
    q: "How do I book a ride?",
    a: "Search your route and date, pick a ride that fits your budget and timing, then book instantly or send a request to the driver. Once confirmed, you'll see pickup details and can track the trip live.",
  },
  {
    q: "How do I publish a ride as a driver?",
    a: "Complete identity verification, add your vehicle and its documents, then tap 'Publish a ride'. Set your route, departure time, number of seats and price per seat — that's it.",
  },
  {
    q: "Why do I need to verify my identity?",
    a: "Verification with Aadhaar and a live selfie keeps the whole community safe and trustworthy. It's a one-time, ~2 minute step required for both drivers and passengers.",
  },
  {
    q: "How do payments work?",
    a: "Payments are handled securely in-app via Razorpay (UPI, cards and wallets). The amount is collected when you book and settled to the driver after the trip completes. Refunds are processed automatically for eligible cancellations.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. Open the booking from 'My trips' and choose to cancel. Depending on how close to departure you cancel, a refund is issued per our cancellation policy.",
  },
  {
    q: "What if I forgot my password?",
    a: "On the sign-in page, tap 'Forgot password?', enter your email, and we'll send you a secure link to set a new password. The link expires in 1 hour.",
  },
  {
    q: "Is my data and document safe?",
    a: "Absolutely. Your documents are used only to verify your identity, are stored securely, and are never shared with other users.",
  },
];

export default function HelpPage() {
  return (
    <div>
      <PageHero
        eyebrow="Help Center"
        icon={LifeBuoy}
        title="How can we help?"
        subtitle="Answers to the most common questions about riding, driving, verification and payments on RideBuddy."
      />

      {/* Quick links */}
      <section className="container py-12">
        <div className="grid sm:grid-cols-3 gap-4">
          <QuickLink
            href="/search"
            icon={SearchIcon}
            title="Book a ride"
            text="Search routes and reserve a seat"
          />
          <QuickLink
            href="/publish"
            icon={PlusCircle}
            title="Publish a ride"
            text="Share your route and earn"
          />
          <QuickLink
            href="/kyc"
            icon={ShieldCheck}
            title="Get verified"
            text="Complete your identity check"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="container pb-14">
        <h2 className="text-2xl md:text-3xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border bg-card overflow-hidden [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-5 font-medium">
                {f.q}
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 -mt-1 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-secondary/40 py-14">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Still need help?
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Our team is here for you. Reach out and we&apos;ll get back as soon as
            we can.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a href="mailto:hello@ridebuddy.in">
              <Card className="hover:border-brand-300 border-2 transition-colors h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">Email us</div>
                    <div className="text-sm text-muted-foreground break-all">
                      hello@ridebuddy.in
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
            <a href="tel:+917987208509">
              <Card className="hover:border-brand-300 border-2 transition-colors h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">Call us</div>
                    <div className="text-sm text-muted-foreground">
                      +91 7987208509
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Looking for safety guidance?{" "}
            <Link href="/safety" className="text-brand-600 font-medium hover:underline">
              Visit our Safety page
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  text,
}: {
  href: string;
  icon: typeof Mail;
  title: string;
  text: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-brand-300 border-2 transition-colors h-full">
        <CardContent className="p-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-muted-foreground">{text}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
