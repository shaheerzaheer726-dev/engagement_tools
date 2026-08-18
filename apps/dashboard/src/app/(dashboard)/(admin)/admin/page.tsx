import { getDb } from "@engagement-tools/database";
import { LogoutButton } from "@/components/LogoutButton";
import { UserManager } from "@/app/(dashboard)/(admin)/admin/_components/UserManager";
import { requireAdminPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdminPage();
  const db = getDb();

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
        initialUsers={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}
