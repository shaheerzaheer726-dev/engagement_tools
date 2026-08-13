import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db, type User } from "@engagement-tools/database";

export const SESSION_COOKIE_NAME = "session_token";
const DEFAULT_SESSION_MINUTES = process.env.SESSION_DURATION_MINUTES
  ? parseInt(process.env.SESSION_DURATION_MINUTES, 10)
  : 60; // default: 60 minutes
const SESSION_DURATION_MS = DEFAULT_SESSION_MINUTES * 60 * 1000;

function newSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Creates a new session for the given user, stores it in the database,
 * and sets the httpOnly session cookie on the response.
 */
export async function createSession(userId: string): Promise<void> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.session.create({
    data: { token, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Reads the session cookie (if any) and returns the associated user,
 * or null if there is no valid, non-expired session.
 */
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    // Expired: clean it up so it doesn't linger in the table.
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Sliding expiration: extend the session expiry on activity to limit
  // the window in which an unattended long-lived cookie stays valid.
  try {
    const newExpires = new Date(Date.now() + SESSION_DURATION_MS);
    await db.session
      .update({ where: { id: session.id }, data: { expiresAt: newExpires } })
      .catch(() => {});

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: newExpires,
    });
  } catch {
    // If updating the expiry fails, proceed with the existing session.user
  }

  return session.user;
}

/**
 * Helper to expose the configured session duration in milliseconds.
 * Useful for route handlers that need to set cookie expiry consistently.
 */
export function getSessionDurationMs(): number {
  return SESSION_DURATION_MS;
}

/**
 * Deletes the current session (if any) from the database and clears the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME, { path: "/" });
}