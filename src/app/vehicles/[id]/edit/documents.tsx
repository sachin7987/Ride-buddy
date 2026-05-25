"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCheck2, Image as ImageIcon, Upload, ExternalLink } from "lucide-react";

type Vehicle = {
  id: string;
  rcUrl: string | null;
  insuranceUrl: string | null;
  photoUrl: string | null;
  isVerified: boolean;
};

export function VehicleDocuments({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <DocCard
        vehicleId={vehicle.id}
        type="RC"
        title="Registration Certificate"
        description="A clear photo of your RC card (front side)."
        existing={vehicle.rcUrl}
        approved={vehicle.isVerified}
      />
      <DocCard
        vehicleId={vehicle.id}
        type="INSURANCE"
        title="Insurance certificate"
        description="Valid insurance papers, must show expiry date."
        existing={vehicle.insuranceUrl}
        approved={vehicle.isVerified}
      />
      <DocCard
        vehicleId={vehicle.id}
        type="PHOTO"
        title="Vehicle photo"
        description="A nice exterior photo to show passengers."
        existing={vehicle.photoUrl}
        approved={!!vehicle.photoUrl}
        optional
      />
    </div>
  );
}

function DocCard({
  vehicleId,
  type,
  title,
  description,
  existing,
  approved,
  optional,
}: {
  vehicleId: string;
  type: "RC" | "INSURANCE" | "PHOTO";
  title: string;
  description: string;
  existing: string | null;
  approved: boolean;
  optional?: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("type", type);
    fd.append("file", file);
    const res = await fetch(`/api/vehicles/${vehicleId}/documents`, {
      method: "POST",
      body: fd,
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data?.error || "Upload failed");
    }
    toast.success(
      type === "PHOTO" ? "Photo updated" : `${title} uploaded — pending review`
    );
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  const status = existing
    ? approved
      ? "approved"
      : "pending"
    : optional
    ? "optional"
    : "missing";

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="aspect-[4/3] bg-muted/30 relative flex items-center justify-center">
        {existing ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={existing}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
            <span className="text-xs">No file uploaded</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          {status === "approved" && (
            <Badge variant="success" className="text-[10px]">
              <FileCheck2 className="h-3 w-3 mr-1" />{type === "PHOTO" ? "Set" : "Approved"}
            </Badge>
          )}
          {status === "pending" && (
            <Badge variant="warning" className="text-[10px]">Under review</Badge>
          )}
          {status === "missing" && (
            <Badge variant="destructive" className="text-[10px]">Required</Badge>
          )}
          {status === "optional" && (
            <Badge variant="muted" className="text-[10px]">Optional</Badge>
          )}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          {existing && (
            <a
              href={existing}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground"
              title="Open original"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={pick}
        />
        <Button
          type="button"
          variant={existing ? "outline" : "gradient"}
          size="sm"
          className="mt-3 w-full"
          loading={busy}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {existing ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  );
}
