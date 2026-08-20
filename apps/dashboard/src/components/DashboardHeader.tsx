import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export function DashboardHeader({
  name,
  roleLabel,
  homeHref,
}: {
  name: string;
  roleLabel: string;
  homeHref: string;
}) {
  return (
    <header className="admin-home-header">
      <div className="admin-home-nav">
        <Link
          href={homeHref}
          className="admin-home-brand"
          aria-label="Workspace home"
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
            <span>{name}</span>
            <small>{roleLabel}</small>
          </div>
          <span className="admin-avatar" aria-hidden="true">
            {name.trim().charAt(0).toUpperCase()}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
