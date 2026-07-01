import { NextResponse } from "next/server";
import { adminCookieName, createAdminSession, verifyPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const ok = await verifyPassword(body.email ?? "", body.password ?? "");

  if (!ok) {
    return NextResponse.json({ error: "Invalid login details." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, await createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
  return response;
}
