import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdminPage();

  return (
    <div className="admin-home">
      <DashboardHeader
        name={admin.name}
        roleLabel="Administrator"
        homeHref="/admin"
      />
      {children}
    </div>
  );
}
