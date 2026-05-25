import { requireUser, userIsDriver } from "@/lib/session";
import { DriverOnlyGate } from "@/components/role-gate";

export default async function VehiclesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (!userIsDriver(user)) {
    return <DriverOnlyGate feature="Vehicle management" />;
  }
  return <>{children}</>;
}
