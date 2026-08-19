import type { ReactNode } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

type AdminOption = {
  number: string;
  title: string;
  description: string;
  symbol: ReactNode;
  href?: string;
};

const adminOptions: AdminOption[] = [
  {
    number: "01",
    title: "View users",
    description: "Review accounts, roles, access status, and user details.",
    symbol: "••",
    href: "/admin/users",
  },
  {
    number: "02",
    title: "Create user",
    description: "Add a new administrator or workspace user.",
    symbol: "+",
    href: "/admin/users?new=1",
  },
  {
    number: "03",
    title: "Profiles",
    description: "Manage social profiles, ownership, and assignments.",
    symbol: "◎",
  },
  {
    number: "04",
    title: "Activity",
    description: "Follow important actions and workspace events.",
    symbol: "↗",
  },
  {
    number: "05",
    title: "Analyses",
    description: "Inspect profile, post, and AI analysis runs.",
    symbol: "✦",
  },
  {
    number: "06",
    title: "Integrations",
    description: "Connect and manage social and AI providers.",
    symbol: "⌁",
  },
];

export default function AdminPage() {
  return (
    <main className="admin-home-content">
      <section aria-labelledby="admin-title">
        <div className="admin-home-intro">
          <div>
            <p className="admin-home-kicker">Admin workspace</p>
          </div>
        </div>

        <div className="admin-option-grid">
          {adminOptions.map((option) =>
            option.href ? (
              <Link
                key={option.number}
                href={option.href}
                className="admin-option-card admin-option-card-live"
              >
                <AdminOptionContent option={option} />
              </Link>
            ) : (
              <article
                key={option.number}
                className="admin-option-card admin-option-card-future"
              >
                <AdminOptionContent option={option} />
              </article>
            ),
          )}
        </div>
      </section>
    </main>
  );
}

function AdminOptionContent({ option }: { option: AdminOption }) {
  const isLive = Boolean(option.href);

  return (
    <>
      <div className="admin-option-topline">
        <span>{option.number}</span>
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
