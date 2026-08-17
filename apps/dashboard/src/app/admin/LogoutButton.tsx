"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
