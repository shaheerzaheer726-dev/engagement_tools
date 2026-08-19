import type { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
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
      <header className="admin-home-header">
        <div className="admin-home-nav">
          <Link
            href="/admin"
            className="admin-home-brand"
            aria-label="Admin home"
          >
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>Engagement Tools</span>
          </Link>

          <div className="admin-account">
            <div className="admin-account-copy">
              <span>{admin.name}</span>
              <small>Administrator</small>
            </div>
            <span className="admin-avatar" aria-hidden="true">
              {admin.name.trim().charAt(0).toUpperCase()}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
