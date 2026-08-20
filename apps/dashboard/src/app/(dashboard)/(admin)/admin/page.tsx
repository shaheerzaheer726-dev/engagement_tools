import { DashboardOptionGrid } from "@/components/DashboardOptions";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <DashboardOptionGrid isAdmin kicker="Admin workspace" />;
}