import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getDb } from "@engagement-tools/database";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { username, password, role } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
    role?: unknown;
  };

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  if (typeof role !== "string" || (role !== "ADMIN" && role !== "USER")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const db = getDb();
  const user = await db.user.findUnique({ where: { username } });

  // For any authentication failure, return the same generic error so an
  // attacker cannot enumerate valid usernames or roles.
  if (!user || user.role !== role || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  });
}
