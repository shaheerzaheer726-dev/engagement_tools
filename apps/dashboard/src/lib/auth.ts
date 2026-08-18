import { redirect } from "next/navigation";
import type { User } from "@engagement-tools/database";
import { getSessionUser } from "./session";

/**
 * For use in Server Components / Pages.
 * Redirects to /login if there is no session, or if the logged-in
 * user is not an active admin.
 */
export async function requireAdminPage(): Promise<User> {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    redirect("/login");
  }

  return user;
}

/**
 * For use in Route Handlers (API routes).
 * Returns the admin user, or null if the caller is not an authenticated,
 * active admin. Callers should return a 401/403 response when null.
 */
export async function requireAdminApi(): Promise<User | null> {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
    return null;
  }

  return user;
}
