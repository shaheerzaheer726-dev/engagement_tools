import { db } from "@engagement-tools/database";
import { requireAdminPage } from "@/lib/auth";
import { UserManager } from "./UserManager";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdminPage();

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdBy: { select: { id: true, username: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Engagement Tools</p>
          <h1>User administration</h1>
          <p className="admin-subtitle">
            Signed in as {admin.name} ({admin.username})
          </p>
        </div>
        <LogoutButton />
      </header>

      <UserManager
        currentAdminId={admin.id}
        initialUsers={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}
