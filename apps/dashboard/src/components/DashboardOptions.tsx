import type { ReactNode } from "react";
import Link from "next/link";

export type DashboardOption = {
  title: string;
  description: string;
  symbol: ReactNode;
  href?: string;
  /** True for options that are only functional for admins (e.g. user management). */
  adminOnly?: boolean;
};

export const dashboardOptions: DashboardOption[] = [
  {
    title: "View users",
    description: "Review accounts, roles, access status, and user details.",
    symbol: "••",
    href: "/admin/users",
    adminOnly: true,
  },
  {
    title: "Create user",
    description: "Add a new administrator or workspace user.",
    symbol: "+",
    href: "/admin/users?new=1",
    adminOnly: true,
  },
  {
    title: "Profiles",
    description: "Manage social profiles, ownership, and assignments.",
    symbol: "◎",
  },
  {
    title: "Activity",
    description: "Follow important actions and workspace events.",
    symbol: "↗",
  },
  {
    title: "Analyses",
    description: "Inspect profile, post, and AI analysis runs.",
    symbol: "✦",
  },
  {
    title: "Integrations",
    description: "Connect and manage social and AI providers.",
    symbol: "⌁",
  },
];

export function DashboardOptionGrid({
  isAdmin,
  kicker,
}: {
  isAdmin: boolean;
  kicker: string;
}) {
  const visibleOptions = dashboardOptions.filter(
    (option) => isAdmin || !option.adminOnly,
  );

  return (
    <main className="admin-home-content">
      <section aria-labelledby="admin-title">
        <div className="admin-home-intro">
          <div>
            <p className="admin-home-kicker">{kicker}</p>
          </div>
        </div>

        <div className="admin-option-grid">
          {visibleOptions.map((option, index) => {
            const displayNumber = String(index + 1).padStart(2, "0");
            const isLive = Boolean(option.href);

            return isLive ? (
              <Link
                key={option.title}
                href={option.href as string}
                className="admin-option-card admin-option-card-live"
              >
                <DashboardOptionContent
                  option={option}
                  displayNumber={displayNumber}
                  isLive
                />
              </Link>
            ) : (
              <article
                key={option.title}
                className="admin-option-card admin-option-card-future"
              >
                <DashboardOptionContent
                  option={option}
                  displayNumber={displayNumber}
                  isLive={false}
                />
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function DashboardOptionContent({
  option,
  displayNumber,
  isLive,
}: {
  option: DashboardOption;
  displayNumber: string;
  isLive: boolean;
}) {
  return (
    <>
      <div className="admin-option-topline">
        <span>{displayNumber}</span>
        {!isLive ? (
          <span className="admin-option-state">Coming soon</span>
        ) : null}
      </div>

      <span className="admin-option-symbol" aria-hidden="true">
        {option.symbol}
      </span>

      <div className="admin-option-copy">
        <h2>{option.title}</h2>
        <p>{option.description}</p>
      </div>

      <div className="admin-option-footer">
        <span></span>
        <span aria-hidden="true">{isLive ? "→" : "·"}</span>
      </div>
    </>
  );
}