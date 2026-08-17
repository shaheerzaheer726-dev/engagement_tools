import Link from "next/link";

export default function HomePage() {
  return (
    <main className="auth-shell">
      <section className="auth-card home-selector-card">
        <p className="eyebrow">Engagement Tools</p>
        <h1>Choose how you want to sign in</h1>
        <p className="auth-subtitle">
          Admins can manage users, and created users can sign in to access the
          sample dashboard.
        </p>
        <div className="button-group">
          <Link href="/login" className="btn btn-primary">
            Admin login
          </Link>
          <Link href="/user/login" className="btn btn-secondary">
            User login
          </Link>
        </div>
      </section>
    </main>
  );
}
