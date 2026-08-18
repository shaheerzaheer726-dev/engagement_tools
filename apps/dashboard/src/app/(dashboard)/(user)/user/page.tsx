import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function UserPage() {
  const user = await getSessionUser();

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
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

      <section className="card">
        <p>You are logged in. Welcome!</p>
      </section>
    </main>
  );
}
