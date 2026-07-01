"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, CheckoutDetails, OrderMode } from "@/lib/menu-types";

const checkoutKey = "shalimar-checkout";
const cartKey = "shalimar-cart";

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mode, setMode] = useState<OrderMode>("delivery");
  const [suburb, setSuburb] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("");
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    const raw = window.localStorage.getItem(checkoutKey);
    if (!raw) return;
    const checkout = JSON.parse(raw) as {
      mode: OrderMode;
      suburb?: string;
      time?: string;
      items: CartItem[];
    };
    queueMicrotask(() => {
      setMode(checkout.mode);
      setSuburb(checkout.suburb ?? "");
      setTime(checkout.time ?? "");
      setItems(checkout.items ?? []);
    });
  }, []);

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const details: CheckoutDetails = {
      mode,
      suburb,
      time,
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      zipcode: String(form.get("zipcode") ?? ""),
      notes: String(form.get("notes") ?? "")
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ details, items })
    });

    if (!response.ok) {
      setStatus("Please check the order details and try again.");
      return;
    }

    window.localStorage.removeItem(cartKey);
    window.localStorage.removeItem(checkoutKey);
    setItems([]);
    setStatus("Thank you. Your order has been received.");
  }

  return (
    <main>
      <section className="section checkout-page">
        <div className="container checkout-grid">
          <form className="checkout-form" onSubmit={submitOrder}>
            <p className="eyebrow dark">Checkout</p>
            <h1>Complete your order</h1>
            <div className="checkout-meta">
              <span>{mode === "delivery" ? "Delivery" : "Pickup"}</span>
              {suburb ? <span>{suburb}</span> : null}
              {time ? <span>{time}</span> : null}
            </div>
            <label>
              <span>Name *</span>
              <input name="name" required placeholder="Name" />
            </label>
            <label>
              <span>Phone *</span>
              <input name="phone" required placeholder="Phone" />
            </label>
            <label className="full-field">
              <span>Address *</span>
              <input name="address" required placeholder="Address" />
            </label>
            <label>
              <span>Zipcode *</span>
              <input name="zipcode" required placeholder="Zipcode" />
            </label>
            <label>
              <span>Order Notes</span>
              <input name="notes" placeholder="Optional" />
            </label>
            <button className="button button-green full-field" type="submit" disabled={!items.length}>
              Place Order
            </button>
            {status ? <p className="form-status">{status}</p> : null}
          </form>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            {items.length ? (
              items.map((item) => (
                <div className="summary-line" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.quantity} x {money(item.price)}
                      {item.size ? ` | ${item.size.name}` : ""}
                      {item.spice ? ` | ${item.spice}` : ""}
                    </small>
                  </div>
                  <span>{money(item.price * item.quantity)}</span>
                </div>
              ))
            ) : (
              <p>Your cart is empty.</p>
            )}
            <div className="summary-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
