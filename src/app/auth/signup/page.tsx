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
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { postSignupRedirect, type UserRole } from "@/lib/roles";
import { validateEmail, suggestEmailFix } from "@/lib/email-validation";

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
  const [step, setStep] = useState<1 | 2>(1);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PASSENGER" as UserRole,
  });

  function onEmailChange(value: string) {
    setForm((f) => ({ ...f, email: value }));
    // Reset error/suggestion as the user types — re-validate on blur instead.
    if (emailError) setEmailError(null);
    if (emailSuggestion) setEmailSuggestion(null);
  }

  async function onEmailBlur() {
    if (!form.email) return;
    const result = validateEmail(form.email);
    if (!result.ok) {
      setEmailError(result.message);
      setEmailSuggestion(
        "suggestion" in result ? result.suggestion ?? null : null
      );
      return;
    }
    setEmailError(null);
    // Even if format is fine, hint at common typos.
    const fix = suggestEmailFix(form.email);
    setEmailSuggestion(fix);

    // Now ask the server whether the address is already registered. We do
    // this *only* after format validation passes so we never query the
    // database on a clearly invalid input.
    setEmailChecking(true);
    try {
      const res = await fetch(
        `/api/auth/check-availability?email=${encodeURIComponent(result.email)}`
      );
      const data = await res.json();
      // The user may have edited the field while the request was in flight —
      // in that case the message would be stale. Bail if so.
      if (form.email.trim().toLowerCase() !== result.email) return;
      if (!data.available && data.reason === "taken") {
        setEmailError(data.message);
      }
    } catch {
      // Silent — the server-side check on submit will catch any duplicates.
    } finally {
      setEmailChecking(false);
    }
  }

  function applySuggestion() {
    if (!emailSuggestion) return;
    setForm((f) => ({ ...f, email: emailSuggestion }));
    setEmailError(null);
    setEmailSuggestion(null);
  }

  function onPhoneChange(value: string) {
    const digits = value.replace(/\D/g, "");
    setForm((f) => ({ ...f, phone: digits }));
    if (phoneError) setPhoneError(null);
  }

  async function onPhoneBlur() {
    const phone = form.phone;
    if (!phone) return;
    if (!/^\d{10}$/.test(phone)) {
      // Browser-native validation will catch this on submit; don't show
      // a duplicate-style error for an in-progress entry.
      return;
    }
    setPhoneChecking(true);
    try {
      const res = await fetch(
        `/api/auth/check-availability?phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (form.phone !== phone) return;
      if (!data.available && data.reason === "taken") {
        setPhoneError(data.message);
      }
    } catch {
      // Server-side check on submit is the ultimate safety net.
    } finally {
      setPhoneChecking(false);
    }
  }

  function nextStep(e: React.FormEvent) {
    e.preventDefault();
    // Final email check before advancing — browser-level validation already
    // ensured the field was filled & matches the type=email pattern.
    const result = validateEmail(form.email);
    if (!result.ok) {
      setEmailError(result.message);
      setEmailSuggestion(
        "suggestion" in result ? result.suggestion ?? null : null
      );
      return;
    }
    // Refuse to advance while there's a known duplicate so the user sees
    // the inline error immediately.
    if (emailError || phoneError) return;
    setForm((f) => ({ ...f, email: result.email }));
    setStep(2);
  }

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
      if (!res.ok) {
        // Server may include a `field` hint so we can route the user back to
        // step 1 with the offending field highlighted.
        if (data?.field === "email") {
          setEmailError(data.error);
          setEmailSuggestion(data.suggestion ?? null);
          setStep(1);
        } else if (data?.field === "phone") {
          setPhoneError(data.error);
          setStep(1);
        }
        throw new Error(data?.error ?? "Failed to register");
      }
      toast.success("Welcome to RideBuddy!", {
        description: `We sent a verification link to ${form.email}.`,
      });
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
            {step === 1
              ? "Join 1M+ riders and drivers on RideBuddy."
              : "Tell us how you'd like to use RideBuddy."}
          </p>

          {/* Step indicator */}
          <div className="mt-5 flex items-center gap-2">
            <StepDot active n={1} done={step === 2} label="Account" />
            <span
              className={cn(
                "h-0.5 flex-1 rounded transition-colors",
                step === 2 ? "bg-brand-500" : "bg-border"
              )}
            />
            <StepDot active={step === 2} n={2} label="Role" />
          </div>

          {step === 1 ? (
            <form onSubmit={nextStep} className="mt-6 space-y-4">
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
                    autoComplete="email"
                    inputMode="email"
                    required
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={cn(
                      "pl-9",
                      emailChecking && "pr-9",
                      emailError &&
                        "border-rose-400 focus-visible:ring-rose-300"
                    )}
                    value={form.email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    onBlur={onEmailBlur}
                  />
                  {emailChecking && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  )}
                </div>
                {emailError && (
                  <p
                    id="email-error"
                    className="mt-1 flex items-start gap-1 text-xs text-rose-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
                {!emailError && emailSuggestion && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Did you mean{" "}
                    <button
                      type="button"
                      onClick={applySuggestion}
                      className="font-medium text-brand-600 underline-offset-2 hover:underline"
                    >
                      {emailSuggestion}
                    </button>
                    ?
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone (10 digits)</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                    className={cn(
                      "pl-9",
                      phoneChecking && "pr-9",
                      phoneError &&
                        "border-rose-400 focus-visible:ring-rose-300"
                    )}
                    value={form.phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    onBlur={onPhoneBlur}
                  />
                  {phoneChecking && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </span>
                  )}
                </div>
                {phoneError && (
                  <p
                    id="phone-error"
                    className="mt-1 flex items-start gap-1 text-xs text-rose-600"
                  >
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
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
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                variant="gradient"
                className="w-full"
                size="lg"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5">
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

              {/* Per-role explainer to set expectations about KYC */}
              <div className="rounded-lg bg-muted/50 border p-3 text-xs text-muted-foreground">
                {form.role === "PASSENGER" ? (
                  <>
                    <strong className="text-foreground">As a passenger,</strong>{" "}
                    you'll only need to verify your identity with Aadhaar and a
                    selfie — no driving license required.
                  </>
                ) : (
                  <>
                    <strong className="text-foreground">As a driver,</strong>{" "}
                    you'll need to verify your identity with your Aadhaar,
                    driving license and a selfie before publishing rides.
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setStep(1)}
                  className="px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  className="flex-1"
                  size="lg"
                  loading={loading}
                >
                  Create account
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-brand-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function StepDot({
  active,
  done,
  n,
  label,
}: {
  active?: boolean;
  done?: boolean;
  n: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-6 w-6 rounded-full text-xs font-semibold flex items-center justify-center transition-colors",
          done
            ? "bg-brand-500 text-white"
            : active
            ? "bg-brand-500 text-white"
            : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <Check className="h-3 w-3" /> : n}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          active || done ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}
