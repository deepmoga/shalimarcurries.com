import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readMenuStore, writeMenuStore } from "@/lib/menu-store";
import type { MenuStore } from "@/lib/menu-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await readMenuStore());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const store = (await request.json()) as MenuStore;
    await writeMenuStore({
      categories: store.categories,
      products: store.products,
      suburbs: store.suburbs,
      timeSlots: store.timeSlots,
      orderOptions: store.orderOptions
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
