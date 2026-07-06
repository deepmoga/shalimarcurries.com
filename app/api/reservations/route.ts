import { NextResponse } from "next/server";
import { sendReservationEmail } from "@/lib/mail";
import { getRemoteIp, verifyRecaptcha } from "@/lib/recaptcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectBack(request: Request, status: "sent" | "error", message = "") {
  const referer = request.headers.get("referer") || "/contact-us";
  const url = new URL(referer, request.url);
  url.searchParams.delete("sent");
  url.searchParams.delete("error");
  url.searchParams.delete("mailError");
  url.searchParams.set(status === "sent" ? "sent" : "error", "1");
  if (message) {
    url.searchParams.set("mailError", message);
  }
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
    return redirectBack(request, "error", "Name and phone are required.");
  }

  const captcha = await verifyRecaptcha(
    String(form.get("g-recaptcha-response") ?? ""),
    getRemoteIp(request)
  );
  if (!captcha.ok) {
    return redirectBack(request, "error", captcha.error);
  }

  const mail = await sendReservationEmail(payload);
  if (!mail.ok) {
    console.error("Reservation email failed", mail.error);
    return redirectBack(request, "error", mail.error);
  }

  return redirectBack(request, "sent");
}
