"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  Lock,
  Users,
  Car,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { postSignupRedirect, type UserRole } from "@/lib/roles";

const ROLE_OPTIONS: {
  value: UserRole;
  title: string;
  desc: string;
  icon: any;
}[] = [
  {
    value: "PASSENGER",
    title: "Passenger",
    desc: "Find rides going your way",
    icon: Users,
  },
  {
    value: "DRIVER",
    title: "Driver",
    desc: "Share your trip, earn money",
    icon: Car,
  },
  {
    value: "BOTH",
    title: "Both",
    desc: "Switch between modes anytime",
    icon: Sparkles,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PASSENGER" as UserRole,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to register");
      toast.success("Welcome to RideBuddy! Signing you in…");
      const signRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signRes?.ok) router.push(postSignupRedirect(form.role));
      else router.push("/auth/signin");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] py-10 px-4 flex items-center justify-center gradient-hero">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join 1M+ riders and drivers on RideBuddy.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Role picker */}
            <div>
              <Label>How will you use RideBuddy?</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = form.role === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: opt.value })}
                      className={cn(
                        "relative flex flex-col items-center text-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-all",
                        selected
                          ? "border-brand-500 bg-brand-50 shadow-sm"
                          : "border-border hover:border-brand-300 hover:bg-accent/40"
                      )}
                    >
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-white">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          selected ? "text-brand-600" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-sm font-medium">{opt.title}</span>
                      <span className="text-[10px] leading-tight text-muted-foreground">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                You can change this later in your profile.
              </p>
            </div>

            <div>
              <Label htmlFor="name">Full name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  required
                  className="pl-9"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  className="pl-9"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone (10 digits)</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  className="pl-9"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  className="pl-9 pr-10"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Create account
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-brand-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
