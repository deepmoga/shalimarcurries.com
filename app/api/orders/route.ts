import { NextResponse } from "next/server";
import { createOrder, readMenuStore } from "@/lib/menu-store";
import type { CartItem, CheckoutDetails } from "@/lib/menu-types";
import { sendOrderEmails } from "@/lib/mail";
import { getRemoteIp, verifyRecaptcha } from "@/lib/recaptcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function perthDayName() {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    timeZone: "Australia/Perth"
  }).format(new Date());
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    details: CheckoutDetails;
    items: CartItem[];
    captchaToken?: string;
  };

  if (!body.details?.name || !body.details?.phone || !body.items?.length) {
    return NextResponse.json(
      { error: "Customer details and cart items are required." },
      { status: 400 }
    );
  }

  const captcha = await verifyRecaptcha(body.captchaToken ?? "", getRemoteIp(request));
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const menu = await readMenuStore();
  const today = perthDayName();
  const availableTimes = menu.timeSlots[today] ?? [];

  if (menu.openingDays?.[today] === false) {
    return NextResponse.json(
      { error: "Restaurant is closed today. Please order on the next open day." },
      { status: 400 }
    );
  }

  const selectedMode = body.details.mode;
  const modeEnabled =
    (selectedMode === "delivery" && menu.orderOptions.delivery) ||
    (selectedMode === "pickup" && menu.orderOptions.pickup);
  if (!modeEnabled) {
    return NextResponse.json(
      { error: `${selectedMode === "delivery" ? "Delivery" : "Pickup"} ordering is currently unavailable.` },
      { status: 400 }
    );
  }

  if (!body.details.time || !availableTimes.includes(body.details.time)) {
    return NextResponse.json(
      { error: "Please select a valid ordering time for today." },
      { status: 400 }
    );
  }

  const order = await createOrder({
    details: body.details,
    items: body.items,
    total: cartTotal(body.items)
  });

  const mail = await sendOrderEmails({
    orderId: order.id,
    details: body.details,
    items: body.items
  });

  if (!mail.ok) {
    console.error("Order email failed", mail.error);
  }

  return NextResponse.json({ ok: true, order, mail });
}
