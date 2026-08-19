import { getDb } from "@engagement-tools/database";
import { requireAdminPage } from "@/lib/auth";
import { UserManager } from "../_components/UserManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [admin, params] = await Promise.all([requireAdminPage(), searchParams]);
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
    <main className="admin-users-page">
      <div className="admin-users-intro">
        <div>
          <p className="admin-home-kicker">User management</p>
          <h1>Users</h1>
          <p>
            Manage workspace access, account status, and credentials from one
            place.
          </p>
        </div>
      </div>

      <UserManager
        currentAdminId={admin.id}
        initialShowCreate={params.new === "1"}
        initialUsers={users.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }))}
      />
    </main>
  );
}
