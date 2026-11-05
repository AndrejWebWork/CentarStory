import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, adminToken, passwordsMatch } from "@/lib/events/managed";

export async function POST(request: Request) {
  const password = adminPassword();
  if (!password) return NextResponse.json({ ok: false, error: "missing" }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const given = body?.password ?? "";
  if (!passwordsMatch(given, password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
