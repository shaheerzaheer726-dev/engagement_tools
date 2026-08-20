import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { requireUserPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUserPage();

  return (
    <div className="admin-home">
      <DashboardHeader name={user.name} roleLabel="User" homeHref="/user" />
      {children}
    </div>
  );
}
