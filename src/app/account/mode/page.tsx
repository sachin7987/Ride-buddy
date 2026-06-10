import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ModeSwitcherForm } from "./role-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Switch mode · RideBuddy",
};

export default async function AccountModePage() {
  const me = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: me.id },
    select: { role: true, kycStatus: true },
  });
  return (
    <div className="container max-w-2xl py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Switch mode</h1>
        <p className="mt-2 text-muted-foreground">
          Choose how you want to use RideBuddy. You can change this anytime.
        </p>
      </div>

      <div className="mt-8">
        <ModeSwitcherForm
          currentRole={(user?.role as any) ?? "PASSENGER"}
          kycStatus={user?.kycStatus ?? "UNVERIFIED"}
        />
      </div>
    </div>
  );
}
