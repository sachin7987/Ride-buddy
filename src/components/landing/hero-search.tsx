"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlacePicker, type Place } from "@/components/place-picker";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { SeatsPicker } from "@/components/ui/seats-picker";
import { Search } from "lucide-react";

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function HeroSearch() {
  const router = useRouter();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [date, setDate] = useState(todayISO());
  const [seats, setSeats] = useState(1);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) {
      params.set("from", from.city);
      params.set("fromLat", String(from.lat));
      params.set("fromLng", String(from.lng));
    }
    if (to) {
      params.set("to", to.city);
      params.set("toLat", String(to.lat));
      params.set("toLng", String(to.lng));
    }
    params.set("date", date);
    params.set("seats", String(seats));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-4xl rounded-2xl border bg-card p-3 shadow-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-stretch">
        <PlacePicker value={from} onChange={setFrom} placeholder="Leaving from" />
        <PlacePicker value={to} onChange={setTo} placeholder="Going to" iconColor="text-red-500" />

        <DatePicker value={date} onChange={setDate} min={todayISO()} placeholder="Departure date" />
        <SeatsPicker value={seats} onChange={setSeats} className="md:w-32" />
        <Button type="submit" variant="gradient" size="lg" className="md:px-6">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
