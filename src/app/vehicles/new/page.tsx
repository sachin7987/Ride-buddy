"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Picker } from "@/components/ui/picker";
import { Car, Bike, Truck } from "lucide-react";

export default function NewVehiclePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState({
    type: "CAR",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    plateNumber: "",
    seats: 4,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data?.error || "Could not save");
    }
    toast.success("Vehicle added!");
    router.push("/vehicles");
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="text-3xl font-bold">Add a vehicle</h1>
      <p className="text-muted-foreground mt-1">
        Tell us about the vehicle you'll use to share rides.
      </p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Vehicle type">
              <Picker
                value={v.type}
                onChange={(t) =>
                  setV({ ...v, type: t, seats: t === "BIKE" ? 1 : 4 })
                }
                options={[
                  { value: "CAR", label: <IconLabel icon={Car} text="Car" /> },
                  { value: "SUV", label: <IconLabel icon={Truck} text="SUV" /> },
                  { value: "BIKE", label: <IconLabel icon={Bike} text="Bike" /> },
                  { value: "AUTO", label: <IconLabel icon={Car} text="Auto" /> },
                  { value: "OTHER", label: <IconLabel icon={Car} text="Other" /> },
                ]}
              />
            </Field>
            <Field label="Number plate">
              <Input
                placeholder="DL01AB1234"
                value={v.plateNumber}
                onChange={(e) =>
                  setV({ ...v, plateNumber: e.target.value.toUpperCase() })
                }
                required
              />
            </Field>
            <Field label="Make">
              <Input
                placeholder="Maruti, Honda, Royal Enfield…"
                value={v.make}
                onChange={(e) => setV({ ...v, make: e.target.value })}
                required
              />
            </Field>
            <Field label="Model">
              <Input
                placeholder="Swift, City, Classic 350…"
                value={v.model}
                onChange={(e) => setV({ ...v, model: e.target.value })}
                required
              />
            </Field>
            <Field label="Year">
              <Input
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={v.year}
                onChange={(e) => setV({ ...v, year: parseInt(e.target.value) })}
                required
              />
            </Field>
            <Field label="Color">
              <Input
                placeholder="White"
                value={v.color}
                onChange={(e) => setV({ ...v, color: e.target.value })}
                required
              />
            </Field>
            <Field label="Passenger seats (excluding driver)">
              <Input
                type="number"
                min={1}
                max={9}
                value={v.seats}
                onChange={(e) => setV({ ...v, seats: parseInt(e.target.value) })}
                required
              />
            </Field>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button variant="gradient" loading={busy}>
                Save vehicle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function IconLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-brand-600" />
      <span>{text}</span>
    </span>
  );
}
