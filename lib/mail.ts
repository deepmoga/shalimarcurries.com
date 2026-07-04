import nodemailer from "nodemailer";
import type { CartItem, CheckoutDetails } from "@/lib/menu-types";
import { readSiteSettings } from "@/lib/site-settings";

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function orderTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderOrderRows(items: CartItem[]) {
  return items
    .map((item) => {
      const options = [item.size?.name, item.spice].filter(Boolean).join(", ");
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #ddd">${item.name}${options ? `<br><small>${options}</small>` : ""}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd">${money(item.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd">${money(item.price * item.quantity)}</td>
      </tr>`;
    })
    .join("");
}

export async function sendOrderEmails({
  orderId,
  details,
  items
}: {
  orderId: string;
  details: CheckoutDetails;
  items: CartItem[];
}) {
  const settings = await readSiteSettings();
  if (!settings.mail.enabled) return;

  const password = process.env[settings.mail.passwordEnvKey];
  if (!password) {
    console.warn(`SMTP password env var ${settings.mail.passwordEnvKey} is not set.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: settings.mail.host,
    port: settings.mail.port,
    secure: settings.mail.secure,
    auth: {
      user: settings.mail.username,
      pass: password
    }
  });

  const total = orderTotal(items);
  const html = `
    <div style="font-family:Arial,sans-serif;color:#14251d">
      <h2>New Shalimar Curries Order</h2>
      <p><strong>Order:</strong> ${orderId}</p>
      <p><strong>Type:</strong> ${details.mode}</p>
      <p><strong>Time:</strong> ${details.time || "Not selected"}</p>
      <p><strong>Customer:</strong> ${details.name}<br>
      <strong>Phone:</strong> ${details.phone}<br>
      <strong>Address:</strong> ${details.address}, ${details.zipcode}<br>
      <strong>Suburb:</strong> ${details.suburb || ""}</p>
      <table style="border-collapse:collapse;width:100%;max-width:700px">
        <thead>
          <tr>
            <th align="left" style="padding:8px;border-bottom:2px solid #085a34">Item</th>
            <th align="left" style="padding:8px;border-bottom:2px solid #085a34">Qty</th>
            <th align="left" style="padding:8px;border-bottom:2px solid #085a34">Price</th>
            <th align="left" style="padding:8px;border-bottom:2px solid #085a34">Total</th>
          </tr>
        </thead>
        <tbody>${renderOrderRows(items)}</tbody>
      </table>
      <h3>Total: ${money(total)}</h3>
      ${details.notes ? `<p><strong>Notes:</strong> ${details.notes}</p>` : ""}
    </div>`;

  await transporter.sendMail({
    from: `"${settings.branding.siteName}" <${settings.mail.fromEmail}>`,
    to: settings.mail.adminEmail,
    subject: `New order ${orderId} - ${money(total)}`,
    html
  });
}

export async function sendReservationEmail({
  name,
  phone,
  email,
  date,
  time,
  people,
  message
}: {
  name: string;
  phone: string;
  email?: string;
  date?: string;
  time?: string;
  people?: string;
  message?: string;
}) {
  const settings = await readSiteSettings();
  if (!settings.mail.enabled) return;

  const password = process.env[settings.mail.passwordEnvKey];
  if (!password) {
    console.warn(`SMTP password env var ${settings.mail.passwordEnvKey} is not set.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: settings.mail.host,
    port: settings.mail.port,
    secure: settings.mail.secure,
    auth: {
      user: settings.mail.username,
      pass: password
    }
  });

  const html = `
    <div style="font-family:Arial,sans-serif;color:#14251d">
      <h2>New Shalimar Curries Enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
      ${date ? `<p><strong>Date:</strong> ${escapeHtml(date)}</p>` : ""}
      ${time ? `<p><strong>Time:</strong> ${escapeHtml(time)}</p>` : ""}
      ${people ? `<p><strong>Person(s):</strong> ${escapeHtml(people)}</p>` : ""}
      ${message ? `<p><strong>Message:</strong><br>${escapeHtml(message)}</p>` : ""}
    </div>`;

  await transporter.sendMail({
    from: `"${settings.branding.siteName}" <${settings.mail.fromEmail}>`,
    to: settings.mail.adminEmail,
    replyTo: email || undefined,
    subject: `New enquiry from ${name}`,
    html
  });
}
