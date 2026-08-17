import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Prisma } from "@engagement-tools/database";
import { db } from "@engagement-tools/database";
import { requireAdminApi } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { writeAuditLog } from "@/lib/audit";

const userSummarySelect = {
  id: true,
  username: true,
  name: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, username: true, name: true } },
} satisfies Prisma.UserSelect;

export async function GET() {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany({
    select: userSummarySelect,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { username, name, password, role } = (body ?? {}) as {
    username?: unknown;
    name?: unknown;
    password?: unknown;
    role?: unknown;
  };

  if (typeof username !== "string" || username.trim().length < 3) {
    return NextResponse.json(
      { error: "Username must be at least 3 characters" },
      { status: 400 },
    );
  }
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }
  const normalizedRole = role === "ADMIN" ? "ADMIN" : "USER";

  const existing = await db.user.findUnique({
    where: { username: username.trim() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "That username is already taken" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await db.user.create({
      data: {
        username: username.trim(),
        name: name.trim(),
        passwordHash,
        role: normalizedRole,
        createdById: admin.id,
      },
      select: userSummarySelect,
    });

    await writeAuditLog({
      actorId: admin.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { username: user.username, role: user.role },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error as any).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That username is already taken" },
        { status: 409 },
      );
    }
    throw error;
  }
}
