import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { UserLoginForm } from "./UserLoginForm";

export const dynamic = "force-dynamic";

export default async function UserLoginPage() {
  const user = await getSessionUser();

  if (user && user.status === "ACTIVE") {
    if (user.role === "ADMIN") {
      redirect("/admin");
    }

    redirect("/user");
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Engagement Tools</p>
        <h1>User sign in</h1>
        <p className="auth-subtitle">
          Login with credentials created by an admin.
        </p>
        <UserLoginForm />
      </section>
    </main>
  );
}
