"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Picker } from "@/components/ui/picker";
import { Sparkles } from "lucide-react";

export function ProfileEdit({
  user,
}: {
  user: {
    name: string;
    bio: string;
    avatarUrl: string;
    role: "PASSENGER" | "DRIVER" | "BOTH";
  };
}) {
  const router = useRouter();
  const search = useSearchParams();
  const { update } = useSession();
  const [form, setForm] = useState(user);
  const [busy, setBusy] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  // When ?becomeDriver=1 is present, scroll to + highlight the role picker
  // and pre-select "BOTH" (the safest default for a passenger-only user).
  const promoteDriver = search.get("becomeDriver") === "1";
  useEffect(() => {
    if (promoteDriver) {
      setForm((f) => (f.role === "PASSENGER" ? { ...f, role: "BOTH" } : f));
      roleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [promoteDriver]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      await update();
      toast.success("Profile updated");
      router.refresh();
    } else toast.error("Could not save");
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {promoteDriver && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800 flex items-start gap-2">
          <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <strong>Welcome, future driver!</strong> Pick "Driver only" or
            "Both" below, save, and you'll unlock publishing rides and managing
            vehicles.
          </div>
        </div>
      )}
      <div>
        <Label>Full name</Label>
        <Input
          className="mt-1"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Avatar URL</Label>
        <Input
          className="mt-1"
          placeholder="https://…"
          value={form.avatarUrl}
          onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
        />
      </div>
      <div
        ref={roleRef}
        className={
          promoteDriver
            ? "rounded-lg ring-2 ring-brand-400 ring-offset-2 -m-1 p-1 transition-all"
            : ""
        }
      >
        <Label>I want to use RideBuddy as</Label>
        <div className="mt-1">
          <Picker
            value={form.role}
            onChange={(v) => setForm({ ...form, role: v })}
            options={[
              { value: "PASSENGER", label: "Passenger only" },
              { value: "DRIVER", label: "Driver only" },
              { value: "BOTH", label: "Both passenger & driver" },
            ]}
          />
        </div>
      </div>
      <div>
        <Label>Bio</Label>
        <Textarea
          rows={3}
          className="mt-1"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="gradient" loading={busy}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
