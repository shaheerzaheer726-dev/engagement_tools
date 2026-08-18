import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
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
        <h1>Sign in</h1>
        <p className="auth-subtitle">Admin access only, for now.</p>
        <LoginForm />
      </section>
    </main>
  );
}
