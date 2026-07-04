import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendTestEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
    const result = await sendTestEmail();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 401 });
  }
}
