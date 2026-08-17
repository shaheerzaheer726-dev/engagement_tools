"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SessionRefresher() {
  const pathname = usePathname();

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
    // Also re-run on client-side navigation (dependency on `pathname`) so
    // the refresh is triggered after navigations that establish a session
    // (for example: signing in via `router.push`). This prevents the
    // originally-observed race where the initial mount ran before the
    // session cookie existed and never re-ran on subsequent navigations.
    if (mounted) refresh();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return null;
}
