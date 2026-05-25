"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export function SearchHeader() {
  const router = useRouter();
  const params = useSearchParams();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [date, setDate] = useState(params.get("date") || todayISO());
  const [seats, setSeats] = useState(parseInt(params.get("seats") || "1"));

  useEffect(() => {
    const f = params.get("from");
    const fLat = params.get("fromLat");
    const fLng = params.get("fromLng");
    if (f && fLat && fLng) {
      setFrom({ city: f, address: f, lat: parseFloat(fLat), lng: parseFloat(fLng) });
    }
    const t = params.get("to");
    const tLat = params.get("toLat");
    const tLng = params.get("toLng");
    if (t && tLat && tLng) {
      setTo({ city: t, address: t, lat: parseFloat(tLat), lng: parseFloat(tLng) });
    }
  }, [params]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = new URLSearchParams();
    if (from) {
      q.set("from", from.city);
      q.set("fromLat", String(from.lat));
      q.set("fromLng", String(from.lng));
    }
    if (to) {
      q.set("to", to.city);
      q.set("toLat", String(to.lat));
      q.set("toLng", String(to.lng));
    }
    q.set("date", date);
    q.set("seats", String(seats));
    router.push(`/search?${q.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-2"
    >
      <PlacePicker value={from} onChange={setFrom} placeholder="From" />
      <PlacePicker value={to} onChange={setTo} placeholder="To" iconColor="text-red-500" />
      <DatePicker value={date} onChange={setDate} min={todayISO()} />
      <SeatsPicker value={seats} onChange={setSeats} className="md:w-32" />
      <Button variant="gradient" size="lg" className="md:px-6">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  );
}
