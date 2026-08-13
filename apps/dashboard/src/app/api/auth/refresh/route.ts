import { NextRequest, NextResponse } from "next/server";
import { db } from "@engagement-tools/database";
import { SESSION_COOKIE_NAME, getSessionDurationMs } from "@/lib/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const session = await db.session.findUnique({ where: { token } });
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });

  // If the session is already expired, signal unauthenticated.
  if (session.expiresAt.getTime() < Date.now()) {
    // Clean up expired session
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const newExpires = new Date(Date.now() + getSessionDurationMs());
  await db.session
    .update({ where: { id: session.id }, data: { expiresAt: newExpires } })
    .catch(() => {});

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: newExpires,
  });

  return res;
}
