import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readOrders } from "@/lib/menu-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await readOrders());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
