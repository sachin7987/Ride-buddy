import Link from "next/link";
import { HeroSearch } from "@/components/landing/hero-search";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { isDriver, isPassenger } from "@/lib/roles";
import {
  ShieldCheck,
  IndianRupee,
  Leaf,
  MapPin,
  Star,
  Smartphone,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  Search as SearchIcon,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const user = session?.user;
  const verified = user?.kycStatus === "VERIFIED";
  const role = (user as any)?.role as string | undefined;
  const showDriverCta = !user || isDriver(role);
  const showPassengerCta = !user || isPassenger(role);
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero">
        <div className="container py-16 md:py-24 lg:py-28 text-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            India's most trusted carpooling community
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            {role === "DRIVER" ? (
              <>
                Drive smart, <br className="hidden md:block" />
                <span className="text-brand-600">earn</span> on every trip.
              </>
            ) : (
              <>
                Share the ride, <br className="hidden md:block" />
                split the <span className="text-brand-600">cost</span>.
              </>
            )}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {role === "DRIVER"
              ? "Got an empty seat? Publish your route, set your price and let RideBuddy fill the seats with verified passengers heading your way."
              : "Find verified drivers heading your way — by car, bike or any vehicle. Save up to 75% on every trip while reducing traffic and emissions."}
          </p>

          {showPassengerCta ? (
            <div className="mt-10">
              <HeroSearch />
            </div>
          ) : (
            <div className="mt-10 flex justify-center">
              <Link href="/publish">
                <Button variant="gradient" size="lg" className="h-14 px-8 text-base">
                  <PlusCircle className="h-5 w-5" /> Publish your first ride
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600" /> ID-verified members
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-brand-600" /> 4.8/5 average rating
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-brand-600" /> 1M+ travellers
            </span>
          </div>
        </div>
      </section>

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

      {/* How it works */}
      <section className="container py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center">How RideBuddy works</h2>
        <p className="mt-3 text-center text-muted-foreground max-w-xl mx-auto">
          Whether you have a vehicle to share or you're looking for a ride, getting
          started is simple.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "1. Verify your identity",
              text: "Upload your driving license & Aadhaar in 2 minutes. We verify everyone — drivers and passengers — for your safety.",
            },
            {
              icon: MapPin,
              title: "2. Publish or search a ride",
              text: "Drivers post their route, time and price per seat. Passengers search the same route and see real-time matches on the map.",
            },
            {
              icon: Smartphone,
              title: "3. Travel and pay in-app",
              text: "Track each other live, chat in-app, pay securely with UPI/cards. Rate the ride at the end to keep the community trustworthy.",
            },
          ].map((step) => (
            <Card key={step.title} className="border-2 hover:border-brand-300 transition-all">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Two-column: drivers & passengers (each side hidden if irrelevant to user) */}
      {(showDriverCta || showPassengerCta) && (
        <section
          className={`container py-16 grid gap-6 ${
            showDriverCta && showPassengerCta ? "md:grid-cols-2" : ""
          }`}
        >
          {showDriverCta && (
            <Card className="overflow-hidden border-2">
              <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white p-8">
                <div className="text-3xl">🚗</div>
                <h3 className="mt-3 text-2xl font-bold">For drivers & vehicle owners</h3>
                <p className="mt-2 text-white/90">
                  Got an empty seat? Make every trip pay for itself.
                </p>
              </div>
              <CardContent className="p-6 space-y-3 text-sm">
                <Bullet>Earn up to ₹15,000/month by sharing your daily route</Bullet>
                <Bullet>Works for cars, bikes, SUVs, autos — anything you own</Bullet>
                <Bullet>Choose your passengers: instant booking or manual approval</Bullet>
                <Bullet>Get paid securely after every trip ends</Bullet>
                <Link href="/publish" className="block pt-2">
                  <Button variant="gradient" className="w-full">
                    Publish a ride
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {showPassengerCta && (
            <Card className="overflow-hidden border-2">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-8">
                <div className="text-3xl">🧳</div>
                <h3 className="mt-3 text-2xl font-bold">For passengers</h3>
                <p className="mt-2 text-white/90">
                  Travel cheaper, faster and friendlier than buses or trains.
                </p>
              </div>
              <CardContent className="p-6 space-y-3 text-sm">
                <Bullet>Save up to 75% vs cabs and 50% vs trains</Bullet>
                <Bullet>Live tracking with your driver so loved ones know where you are</Bullet>
                <Bullet>Verified drivers, ratings and reviews on every profile</Bullet>
                <Bullet>Door-to-door pickup, no platform queues</Bullet>
                <Link href="/search" className="block pt-2">
                  <Button className="w-full" variant="outline">
                    Find a ride
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      )}

      {/* Why us */}
      <section className="bg-secondary/40 py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center">Why RideBuddy?</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, t: "Verified members", d: "Aadhaar + driving license verification on every profile." },
              { icon: IndianRupee, t: "Cheapest rides", d: "Direct between people — no commission, no hidden fees." },
              { icon: Leaf, t: "Eco-friendly", d: "Every shared seat saves ~85kg CO₂. Travel green." },
              { icon: Clock, t: "Live tracking", d: "Real-time location of driver and ETA, end-to-end." },
              { icon: Star, t: "Reviews & trust", d: "Community-driven ratings keep the bad apples out." },
              { icon: Smartphone, t: "Easy payments", d: "Razorpay-powered UPI, cards, wallets — instant refunds." },
            ].map((f) => (
              <Card key={f.t}>
                <CardContent className="p-6">
                  <f.icon className="h-6 w-6 text-brand-600" />
                  <h4 className="mt-3 font-semibold">{f.t}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — adapts to logged-in state */}
      <section className="container py-16">
        <Card className="overflow-hidden border-2 border-brand-200">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              {user ? (
                verified ? (
                  <>
                    <h2 className="text-3xl font-bold">
                      Welcome back, {user.name.split(" ")[0]}.
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                      {showDriverCta && showPassengerCta
                        ? "You're all set. Publish your next ride or find one heading your way."
                        : showDriverCta
                        ? "You're all set. Publish your next ride and start earning."
                        : "You're all set. Find your next ride below."}
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      {showDriverCta && (
                        <Link href="/publish">
                          <Button variant="gradient" size="lg">
                            <PlusCircle className="h-4 w-4" /> Publish a ride
                          </Button>
                        </Link>
                      )}
                      {showPassengerCta && (
                        <Link href="/search">
                          <Button
                            variant={showDriverCta ? "outline" : "gradient"}
                            size="lg"
                          >
                            <SearchIcon className="h-4 w-4" /> Find a ride
                          </Button>
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold">
                      One quick step, {user.name.split(" ")[0]}.
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                      Verify your identity to unlock {showDriverCta ? "publishing rides and " : ""}
                      instant booking. Takes about 2 minutes.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Link href="/kyc">
                        <Button variant="gradient" size="lg">
                          <ShieldCheck className="h-4 w-4" /> Verify my identity
                        </Button>
                      </Link>
                      {showPassengerCta && (
                        <Link href="/search">
                          <Button variant="outline" size="lg">
                            <SearchIcon className="h-4 w-4" /> Browse rides
                          </Button>
                        </Link>
                      )}
                    </div>
                  </>
                )
              ) : (
                <>
                  <h2 className="text-3xl font-bold">Ready to start sharing rides?</h2>
                  <p className="mt-3 text-muted-foreground">
                    Create your free account, complete verification once, and you're ready
                    to publish or book your first ride.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link href="/auth/signup">
                      <Button variant="gradient" size="lg">
                        Create free account
                      </Button>
                    </Link>
                    <Link href="/search">
                      <Button variant="outline" size="lg">
                        Browse rides
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-8 md:p-12 text-white flex flex-col justify-center">
              <p className="text-sm uppercase tracking-wider opacity-80">Today on RideBuddy</p>
              <div className="mt-3 space-y-3">
                <Live name="Riya Sharma" route="Bengaluru → Mysuru" amount="₹450" />
                <Live name="Arjun Verma" route="Delhi → Jaipur" amount="₹650" />
                <Live name="Meera P." route="Mumbai → Pune" amount="₹380" />
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 mt-0.5 text-brand-600 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Live({ name, route, amount }: { name: string; route: string; amount: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/10 backdrop-blur-sm p-3">
      <div>
        <div className="font-medium text-sm">{name}</div>
        <div className="text-xs opacity-80">{route}</div>
      </div>
      <div className="text-sm font-semibold">{amount}</div>
    </div>
  );
}
