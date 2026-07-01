import { NextResponse } from "next/server";
import { siteContent } from "@/content/home";

export async function GET() {
  return NextResponse.json(siteContent);
}
