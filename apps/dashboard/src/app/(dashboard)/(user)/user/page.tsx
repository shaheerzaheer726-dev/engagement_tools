import { DashboardOptionGrid } from "@/components/DashboardOptions";

export const dynamic = "force-dynamic";

export default function UserPage() {
  return <DashboardOptionGrid isAdmin={false} kicker="Workspace" />;
}