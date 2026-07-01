import { NextResponse } from "next/server";
import { readMenuStore } from "@/lib/menu-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readMenuStore());
}
