"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileCheck2, Image as ImageIcon } from "lucide-react";

type Doc = {
  id: string;
  type: string;
  status: string;
  fileUrl: string;
  number: string | null;
  reviewNote: string | null;
};

export function KycUploader({
  type,
  title,
  description,
  existing,
  requiresNumber,
}: {
  type: string;
  title: string;
  description: string;
  existing?: Doc;
  requiresNumber?: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [number, setNumber] = useState(existing?.number ?? "");
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!file) return toast.error("Choose a file first");
    if (requiresNumber && number.trim().length < 4)
      return toast.error("Please enter your document number");

    setBusy(true);
    const fd = new FormData();
    fd.append("type", type);
    fd.append("file", file);
    if (number) fd.append("number", number);
    const res = await fetch("/api/kyc", { method: "POST", body: fd });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data?.error || "Upload failed", {
        description: data?.hint || undefined,
        duration: 8000,
      });
    }
    toast.success(`${title} uploaded — pending review`);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          {existing && (
            <Badge
              variant={
                existing.status === "APPROVED"
                  ? "success"
                  : existing.status === "REJECTED"
                  ? "destructive"
                  : "warning"
              }
            >
              {existing.status}
            </Badge>
          )}
        </div>

        {requiresNumber && (
          <div className="mt-4">
            <label className="text-sm font-medium">Document number</label>
            <Input
              className="mt-1"
              placeholder={
                type === "AADHAAR" ? "1234 5678 9012" : "DL-XX-XXXXXXXXXXX"
              }
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Upload image (max 5MB)</label>
            <div
              className="mt-1 rounded-lg border-2 border-dashed p-4 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-1 text-sm">
                {file ? (
                  <span className="font-medium">{file.name}</span>
                ) : existing ? (
                  <span className="text-muted-foreground">
                    Click to replace existing image
                  </span>
                ) : (
                  <span className="text-muted-foreground">Click to choose a file</span>
                )}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <Button onClick={upload} loading={busy} disabled={!file}>
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>

        {existing && existing.status === "APPROVED" && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
            <FileCheck2 className="h-4 w-4" /> Approved by RideBuddy team
          </div>
        )}
        {existing?.reviewNote && (
          <p className="mt-2 text-sm text-muted-foreground">
            <strong>Note:</strong> {existing.reviewNote}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
