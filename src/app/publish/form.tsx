"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlacePicker, type Place } from "@/components/place-picker";
import { Map } from "@/components/map-loader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Picker } from "@/components/ui/picker";
import { DatePicker, TimePicker } from "@/components/ui/date-picker";
import { haversineKm, formatINR } from "@/lib/utils";
import { Calendar, Clock, IndianRupee, Users, Car } from "lucide-react";

type Vehicle = {
  id: string;
  type: string;
  make: string;
  model: string;
  plateNumber: string;
  seats: number;
};

export function PublishRideForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id);
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [time, setTime] = useState("09:00");
  const [seats, setSeats] = useState(vehicles[0]?.seats ?? 4);
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [opts, setOpts] = useState({
    instantBooking: true,
    womenOnly: false,
    allowMusic: true,
    allowSmoking: false,
    allowPets: false,
  });

  const distance = useMemo(() => {
    if (!from || !to) return 0;
    return haversineKm(from, to);
  }, [from, to]);

  const suggested = useMemo(() => {
    if (!distance) return 0;
    // ~₹4/km baseline split across passengers
    const v = vehicles.find((x) => x.id === vehicleId);
    const isBike = v?.type === "BIKE";
    const perKm = isBike ? 2 : 4;
    return Math.max(50, Math.round((distance * perKm) / 50) * 50);
  }, [distance, vehicleId, vehicles]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) return toast.error("Please pick from and to locations");
    if (price < 0) return toast.error("Invalid price");

    setBusy(true);
    const departureTime = new Date(`${date}T${time}:00`);
    const res = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromCity: from.city,
        fromAddress: from.address,
        fromLat: from.lat,
        fromLng: from.lng,
        toCity: to.city,
        toAddress: to.address,
        toLat: to.lat,
        toLng: to.lng,
        departureTime: departureTime.toISOString(),
        totalSeats: seats,
        pricePerSeat: price,
        description,
        vehicleId,
        ...opts,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data?.error || "Could not publish ride");
    }
    const { ride } = await res.json();
    toast.success("Ride published!");
    router.push(`/rides/${ride.id}`);
  }

  const v = vehicles.find((x) => x.id === vehicleId);

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Route</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>From</Label>
              <div className="mt-1">
                <PlacePicker value={from} onChange={setFrom} placeholder="Pickup city / address" />
              </div>
            </div>
            <div>
              <Label>To</Label>
              <div className="mt-1">
                <PlacePicker value={to} onChange={setTo} placeholder="Drop city / address" iconColor="text-red-500" />
              </div>
            </div>
          </div>
          {from && to && (
            <>
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">{distance.toFixed(0)} km</strong> approx, ~
                {Math.round((distance / 50) * 60)} min drive
              </div>
              <Map from={from} to={to} height={260} />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">When?</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Date" icon={Calendar}>
              <DatePicker
                value={date}
                onChange={setDate}
                min={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Field label="Departure time" icon={Clock}>
              <TimePicker value={time} onChange={setTime} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Vehicle, seats & price</h3>
          <Field label="Vehicle" icon={Car}>
            <Picker
              value={vehicleId}
              onChange={(v) => setVehicleId(v)}
              options={vehicles.map((v) => ({
                value: v.id,
                label: (
                  <span className="flex items-center gap-2">
                    <Car className="h-3.5 w-3.5 text-brand-600" />
                    <span>
                      {v.make} {v.model}
                      <span className="text-muted-foreground">
                        {" "}
                        · {v.plateNumber} · {v.type}
                      </span>
                    </span>
                  </span>
                ),
              }))}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Seats available" icon={Users}>
              <Input
                type="number"
                min={1}
                max={v?.seats ?? 8}
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                required
              />
            </Field>
            <Field label="Price per seat (₹)" icon={IndianRupee}>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
              />
              {suggested > 0 && (
                <button
                  type="button"
                  onClick={() => setPrice(suggested)}
                  className="mt-1 text-xs text-brand-600 hover:underline"
                >
                  Use suggested price: {formatINR(suggested)}
                </button>
              )}
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">Preferences</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Toggle
              label="Instant booking"
              description="Passengers book without your approval"
              checked={opts.instantBooking}
              onChange={(b) => setOpts({ ...opts, instantBooking: b })}
            />
            <Toggle
              label="Women only"
              description="Only women can book this ride"
              checked={opts.womenOnly}
              onChange={(b) => setOpts({ ...opts, womenOnly: b })}
            />
            <Toggle
              label="Music allowed"
              checked={opts.allowMusic}
              onChange={(b) => setOpts({ ...opts, allowMusic: b })}
            />
            <Toggle
              label="Smoking allowed"
              checked={opts.allowSmoking}
              onChange={(b) => setOpts({ ...opts, allowSmoking: b })}
            />
            <Toggle
              label="Pets allowed"
              checked={opts.allowPets}
              onChange={(b) => setOpts({ ...opts, allowPets: b })}
            />
          </div>
          <div>
            <Label>Notes for passengers (optional)</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="I'll be picking up near the metro station, please be ready 5 min early."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="gradient" size="lg" loading={busy}>
          Publish ride
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: any;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />} {label}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`text-left rounded-lg border p-3 transition-colors ${
        checked ? "border-brand-500 bg-brand-50" : "hover:bg-accent"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm">{label}</span>
        <span
          className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
            checked ? "bg-brand-500" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-4" : ""
            }`}
          />
        </span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </button>
  );
}
