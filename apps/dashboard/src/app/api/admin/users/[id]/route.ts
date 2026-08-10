import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Prisma, db } from "@engagement-tools/database";
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

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { password, status, name } = (body ?? {}) as {
    password?: unknown;
    status?: unknown;
    name?: unknown;
  };

  const data: Prisma.UserUpdateInput = {};
  const auditEvents: string[] = [];

  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }
    data.passwordHash = await hashPassword(password);
    auditEvents.push("user.password_reset");
  }

  if (status !== undefined) {
    if (status !== "ACTIVE" && status !== "DISABLED") {
      return NextResponse.json(
        { error: "Status must be ACTIVE or DISABLED" },
        { status: 400 },
      );
    }
    data.status = status;
    auditEvents.push(`user.status_set_${status.toLowerCase()}`);
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 },
      );
    }
    data.name = name.trim();
    auditEvents.push("user.name_update");
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  try {
    const user = await db.user.update({
      where: { id },
      data,
      select: userSummarySelect,
    });

    for (const action of auditEvents) {
      await writeAuditLog({
        actorId: admin.id,
        action,
        entityType: "User",
        entityId: user.id,
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const admin = await requireAdminApi();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  try {
    const deleted = await db.user.delete({
      where: { id },
      select: { id: true, username: true },
    });

    await writeAuditLog({
      actorId: admin.id,
      action: "user.delete",
      entityType: "User",
      entityId: deleted.id,
      metadata: { username: deleted.username },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "This user created other user accounts and can't be deleted while those accounts exist.",
          },
          { status: 409 },
        );
      }
    }
    throw error;
  }
}