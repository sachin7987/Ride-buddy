import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { KycUploader } from "./uploader";
import { requiredKycDocs } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function KycPage() {
  const user = await requireUser();
  const docs = await prisma.kycDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { kycStatus: true, role: true },
  });
  const status = dbUser?.kycStatus ?? "UNVERIFIED";
  const role = dbUser?.role ?? "BOTH";
  const required = requiredKycDocs(role);
  const isPassengerOnly = role === "PASSENGER";

  const byType = (t: string) => docs.find((d) => d.type === t);

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Identity verification</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {isPassengerOnly
              ? "As a passenger, we just need your Aadhaar and a selfie to keep our community safe."
              : "Required for everyone — drivers and passengers — to keep our community safe."}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {status === "VERIFIED" && (
        <Card className="mt-6 border-emerald-300 bg-emerald-50">
          <CardContent className="p-6 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">You're fully verified.</p>
              <p className="text-sm text-emerald-800 mt-1">
                {isPassengerOnly
                  ? "You can now book any ride without restrictions."
                  : "You can now publish rides and book without restrictions."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {status === "PENDING" && (
        <Card className="mt-6 border-amber-300 bg-amber-50">
          <CardContent className="p-6 flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Review in progress</p>
              <p className="text-sm text-amber-800 mt-1">
                Our team is reviewing your documents. This usually takes under 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {status === "REJECTED" && (
        <Card className="mt-6 border-rose-300 bg-rose-50">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Verification rejected</p>
              <p className="text-sm text-rose-800 mt-1">
                Please re-upload clear images of the requested documents.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 space-y-4">
        {required.includes("DRIVING_LICENSE") && (
          <KycUploader
            type="DRIVING_LICENSE"
            title="Driving License"
            description="Required to drive. Front side, fully visible."
            existing={byType("DRIVING_LICENSE")}
            requiresNumber
          />
        )}
        <KycUploader
          type="AADHAAR"
          title="Aadhaar Card"
          description="Front & back combined into one image. Mask 8 digits if you wish."
          existing={byType("AADHAAR")}
          requiresNumber
        />
        <KycUploader
          type="SELFIE"
          title="Live selfie"
          description="A clear photo of yourself, holding your ID next to your face."
          existing={byType("SELFIE")}
        />
      </div>

      {isPassengerOnly && (
        <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-foreground">
            Want to drive too? Upgrade your account to access publishing rides.
          </p>
          <Link
            href="/profile?becomeDriver=1"
            className="text-brand-600 hover:underline text-sm font-medium"
          >
            Become a driver →
          </Link>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        We never share your documents. They are used only to verify your identity. By
        uploading, you agree to our{" "}
        <Link href="#" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { variant: any; label: string; icon: any }> = {
    UNVERIFIED: { variant: "muted", label: "Not started", icon: ShieldCheck },
    PENDING: { variant: "warning", label: "Under review", icon: Clock },
    VERIFIED: { variant: "success", label: "Verified", icon: CheckCircle2 },
    REJECTED: { variant: "destructive", label: "Rejected", icon: AlertTriangle },
  };
  const m = map[status] ?? map.UNVERIFIED;
  return (
    <Badge variant={m.variant} className="shrink-0 text-xs px-3 py-1.5">
      <m.icon className="h-3.5 w-3.5 mr-1" />
      {m.label}
    </Badge>
  );
}
