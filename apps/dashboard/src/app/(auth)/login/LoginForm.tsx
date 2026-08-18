"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type AuthenticatedRole = "ADMIN" | "USER";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as {
        error?: string;
        user?: { role?: AuthenticatedRole };
      };

      if (!response.ok || !data.user?.role) {
        setError(data.error ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace(data.user.role === "ADMIN" ? "/admin" : "/user");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-field">
        <span>Username</span>
        <input
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter your username"
          required
          autoFocus
        />
      </label>

      <label className="login-field">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />
      </label>

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="login-submit" disabled={isSubmitting}>
        <span>{isSubmitting ? "Signing in…" : "Sign in"}</span>
        {!isSubmitting && <span aria-hidden="true">→</span>}
      </button>
    </form>
  );
}
