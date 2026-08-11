import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LogoutButton } from "../admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function UserPage() {
  const user = await getSessionUser();

  if (!user || user.status !== "ACTIVE") {
    redirect("/user/login");
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Engagement Tools</p>
          <h1>Welcome, {user.name}</h1>
          <p className="admin-subtitle">
            You are logged in as {user.username} ({user.role})
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="admin-card">
        <p>You are logged in. Welcome!</p>
      </section>
    </main>
  );
}
