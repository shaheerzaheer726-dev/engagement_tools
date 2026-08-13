"use client";

import { useEffect } from "react";

export default function SessionRefresher() {
  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
        });
      } catch {
        // ignore errors
      }
    }

    // Refresh once when the app mounts in the browser to extend the cookie
    // and server-side session expiry for active users.
    if (mounted) refresh();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}
