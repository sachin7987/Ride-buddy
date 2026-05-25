"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Picker } from "@/components/ui/picker";
import { Car, Bike, Truck } from "lucide-react";

type Vehicle = {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  seats: number;
};

export function EditVehicleForm({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState({
    type: vehicle.type,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    plateNumber: vehicle.plateNumber,
    seats: vehicle.seats,
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`/api/vehicles/${vehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data?.error || "Could not save");
    }
    const data = await res.json();
    if (data.reverificationRequired) {
      toast.message("Vehicle saved", {
        description:
          "You changed key details — verification will need to be redone.",
      });
    } else {
      toast.success("Vehicle updated");
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
      <Field label="Vehicle type">
        <Picker
          value={v.type}
          onChange={(t) =>
            setV({ ...v, type: t, seats: t === "BIKE" ? 1 : v.seats })
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
          value={v.plateNumber}
          onChange={(e) =>
            setV({ ...v, plateNumber: e.target.value.toUpperCase() })
          }
          required
        />
      </Field>
      <Field label="Make">
        <Input
          value={v.make}
          onChange={(e) => setV({ ...v, make: e.target.value })}
          required
        />
      </Field>
      <Field label="Model">
        <Input
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
        <Button variant="gradient" loading={busy}>
          Save changes
        </Button>
      </div>
    </form>
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
