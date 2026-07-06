import { NextResponse } from "next/server";
import { createOrder } from "@/lib/menu-store";
import type { CartItem, CheckoutDetails } from "@/lib/menu-types";
import { sendOrderEmails } from "@/lib/mail";
import { getRemoteIp, verifyRecaptcha } from "@/lib/recaptcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
