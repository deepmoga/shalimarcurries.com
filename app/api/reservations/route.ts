import { NextResponse } from "next/server";
import { sendReservationEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectBack(request: Request, status: "sent" | "error") {
  const referer = request.headers.get("referer") || "/contact-us";
  const url = new URL(referer, request.url);
  url.searchParams.delete("sent");
  url.searchParams.delete("error");
  url.searchParams.set(status === "sent" ? "sent" : "error", "1");
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const payload = {
    name: String(form.get("name") ?? "").trim(),
    phone: String(form.get("phone") ?? "").trim(),
    email: String(form.get("email") ?? "").trim(),
    date: String(form.get("date") ?? "").trim(),
    time: String(form.get("time") ?? "").trim(),
    people: String(form.get("people") ?? "").trim(),
    message: String(form.get("message") ?? "").trim()
  };

  if (!payload.name || !payload.phone) {
    return redirectBack(request, "error");
  }

  await sendReservationEmail(payload).catch((error) => {
    console.error("Reservation email failed", error);
  });

  return redirectBack(request, "sent");
}
