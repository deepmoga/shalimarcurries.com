import { NextResponse } from "next/server";
import { requireAdmin, updateAdminPassword } from "@/lib/admin-auth";
import { readSiteSettings, writeSiteSettings } from "@/lib/site-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await readSiteSettings());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const current = await readSiteSettings();
    const mailPassword = body.mail?.password || body.mail?.passwordEnvKey || current.mail.password || "";
    const next = {
      ...current,
      branding: body.branding,
      contact: body.contact,
      mail: {
        ...body.mail,
        password: mailPassword,
        passwordEnvKey: undefined
      },
      admin: {
        ...current.admin,
        email: body.admin?.email || current.admin.email
      }
    };
    await writeSiteSettings(next);
    if (body.admin?.newPassword) {
      await updateAdminPassword(body.admin.newPassword);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
