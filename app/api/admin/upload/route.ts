import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/menu-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const extension = path.extname(file.name) || ".jpg";
  const safeName = `${slugify(file.name.replace(extension, ""))}-${Date.now()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  const destination = path.join(uploadDirectory, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(destination, buffer);

  return NextResponse.json({ url: `/uploads/${safeName}` });
}
