import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in | Engagement Tools",
  description: "Sign in to your Engagement Tools workspace.",
};

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user?.status === "ACTIVE") {
    redirect(user.role === "ADMIN" ? "/admin" : "/user");
  }

  return (
    <main className="login-page">
      <div className="login-frame">
        <section className="login-brand" aria-labelledby="login-brand-title">
          <div className="login-brand-copy">
            <p className="login-kicker">Your engagement workspace</p>
            <h1 id="login-brand-title">
              Turn attention into <span>conversation.</span>
            </h1>
            <p>
              Research the people who matter, understand what they share, and
              engage with relevance.
            </p>
          </div>

          <div className="signal-preview" aria-hidden="true">
            <div className="signal-glow" />
            <div className="signal-card signal-card-back">
              <span className="signal-avatar signal-avatar-cyan" />
              <span className="signal-line signal-line-short" />
            </div>
            <div className="signal-card signal-card-front">
              <div className="signal-card-top">
                <span className="signal-avatar" />
                <div>
                  <span className="signal-line signal-line-name" />
                  <span className="signal-line signal-line-handle" />
                </div>
                <span className="signal-status">Relevant</span>
              </div>
              <span className="signal-line signal-line-copy" />
              <span className="signal-line signal-line-copy signal-line-copy-short" />
              <div className="signal-tags">
                <span>AI</span>
                <span>Growth</span>
                <span>Product</span>
              </div>
            </div>
          </div>

          <p className="login-brand-footer">Research · Understand · Engage</p>
        </section>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel-inner">
            <LoginForm />

            <p className="login-help">
              Need access? Contact your workspace administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
