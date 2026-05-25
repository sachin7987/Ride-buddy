"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Search, Loader2, Sparkles, History, Navigation } from "lucide-react";
import { searchCities, type City } from "@/lib/cities";
import { cn } from "@/lib/utils";

export type Place = {
  city: string;
  state?: string;
  address: string;
  lat: number;
  lng: number;
};

const RECENTS_KEY = "ridebuddy.recentPlaces";
const MAX_RECENTS = 5;

function loadRecents(): Place[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
  } catch {
    return [];
  }
}
function pushRecent(p: Place) {
  if (typeof window === "undefined") return;
  const cur = loadRecents().filter(
    (x) => !(x.lat === p.lat && x.lng === p.lng)
  );
  const next = [p, ...cur].slice(0, MAX_RECENTS);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
}

export function PlacePicker({
  value,
  onChange,
  placeholder = "City or address",
  iconColor = "text-brand-600",
  className,
}: {
  value: Place | null;
  onChange: (p: Place) => void;
  placeholder?: string;
  iconColor?: string;
  className?: string;
}) {
  const [q, setQ] = useState(value?.address || value?.city || "");
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<Place[]>([]);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setQ(value?.address || value?.city || "");
  }, [value]);

  useEffect(() => {
    if (open) setRecents(loadRecents());
  }, [open]);

  // Search cities locally + Nominatim remotely (debounced)
  const cityResults = useMemo(() => searchCities(q), [q]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (q.trim().length < 3) {
      setRemote([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=5&q=${encodeURIComponent(
            q
          )}`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = (await res.json()) as Array<{
          display_name: string;
          lat: string;
          lon: string;
          address?: { city?: string; town?: string; state?: string; village?: string };
        }>;
        setRemote(
          data.map((d) => ({
            address: d.display_name,
            city:
              d.address?.city ||
              d.address?.town ||
              d.address?.village ||
              d.display_name.split(",")[0],
            state: d.address?.state,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          }))
        );
      } catch {
        setRemote([]);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Build a flat ordered list for keyboard nav
  const showRecents = q.trim().length === 0 && recents.length > 0;
  const orderedItems: Array<
    | { kind: "recent"; place: Place }
    | { kind: "city"; city: City }
    | { kind: "remote"; place: Place }
  > = [];
  if (showRecents) recents.forEach((p) => orderedItems.push({ kind: "recent", place: p }));
  cityResults.forEach((c) => orderedItems.push({ kind: "city", city: c }));
  remote.forEach((p) => orderedItems.push({ kind: "remote", place: p }));

  useEffect(() => {
    setHighlight(0);
  }, [q, open]);

  function selectAt(i: number) {
    const item = orderedItems[i];
    if (!item) return;
    if (item.kind === "city") {
      const p: Place = {
        city: item.city.name,
        state: item.city.state,
        address: `${item.city.name}, ${item.city.state}`,
        lat: item.city.lat,
        lng: item.city.lng,
      };
      pickPlace(p);
    } else {
      pickPlace(item.place);
    }
  }
  function pickPlace(p: Place) {
    onChange(p);
    setQ(p.address);
    setOpen(false);
    pushRecent(p);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(orderedItems.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectAt(highlight);
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  let cursor = 0;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div className="relative">
        <MapPin
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10",
            iconColor
          )}
        />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-12 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[3.4rem] z-[1100] max-h-[420px] min-w-[320px] overflow-auto app-scroll rounded-2xl border bg-card shadow-2xl ring-1 ring-black/5 animate-fade-in">
          <div className="py-2">
            {showRecents && (
              <Section
                icon={History}
                title="Recent searches"
                action={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      localStorage.removeItem(RECENTS_KEY);
                      setRecents([]);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                }
              >
                {recents.map((p, i) => {
                  const idx = cursor++;
                  return (
                    <Row
                      key={`r-${i}`}
                      icon={Navigation}
                      title={p.city}
                      subtitle={p.address}
                      active={highlight === idx}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => pickPlace(p)}
                      tone="muted"
                    />
                  );
                })}
              </Section>
            )}

            {cityResults.length > 0 && (
              <Section
                icon={Sparkles}
                title={q.trim() ? "Matching cities" : "Popular cities"}
              >
                {cityResults.map((c) => {
                  const idx = cursor++;
                  return (
                    <Row
                      key={`${c.name}-${c.state}`}
                      icon={MapPin}
                      title={c.name}
                      subtitle={c.state}
                      active={highlight === idx}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() =>
                        pickPlace({
                          city: c.name,
                          state: c.state,
                          address: `${c.name}, ${c.state}`,
                          lat: c.lat,
                          lng: c.lng,
                        })
                      }
                    />
                  );
                })}
              </Section>
            )}

            {remote.length > 0 && (
              <Section icon={Search} title="More results from OpenStreetMap">
                {remote.map((p, i) => {
                  const idx = cursor++;
                  return (
                    <Row
                      key={`rm-${i}`}
                      icon={MapPin}
                      title={p.city}
                      subtitle={p.address}
                      active={highlight === idx}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => pickPlace(p)}
                    />
                  );
                })}
              </Section>
            )}

            {!loading && cityResults.length === 0 && remote.length === 0 && (
              <div className="px-4 py-8 text-center">
                <Search className="h-5 w-5 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No matches</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try typing at least 3 characters of a city or area
                </p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 px-3 py-2 border-t bg-card/95 backdrop-blur-sm flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-3">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span>navigate</span>
              <Kbd>↵</Kbd>
              <span>select</span>
              <Kbd>esc</Kbd>
              <span>close</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              Powered by OpenStreetMap
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: any;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <span className="flex items-center gap-1.5">
          <Icon className="h-3 w-3" />
          {title}
        </span>
        {action}
      </div>
      <div className="px-1.5 pb-1">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  title,
  subtitle,
  active,
  onClick,
  onMouseEnter,
  tone = "brand",
}: {
  icon: any;
  title: string;
  subtitle?: string;
  active?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  tone?: "brand" | "muted";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors",
        active ? "bg-accent" : "hover:bg-accent/60"
      )}
    >
      <span
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          tone === "brand"
            ? "bg-brand-100 text-brand-700"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium truncate">{title}</span>
        {subtitle && (
          <span className="block text-xs text-muted-foreground truncate">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded border bg-background font-mono text-[10px] text-foreground shadow-sm">
      {children}
    </kbd>
  );
}
