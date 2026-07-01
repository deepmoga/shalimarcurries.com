import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { readSiteSettings, writeSiteSettings } from "@/lib/site-settings";

export const adminCookieName = "shalimar_admin_session";

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-change-before-production";
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

export async function verifyPassword(email: string, password: string) {
  const settings = await readSiteSettings();
  if (email.toLowerCase().trim() !== settings.admin.email.toLowerCase()) {
    return false;
  }

  const [salt, storedHash] = settings.admin.passwordHash.split(":");
  const attempted = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(attempted, "hex"));
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export async function createAdminSession() {
  const settings = await readSiteSettings();
  const payload = JSON.stringify({
    email: settings.admin.email,
    expires: Date.now() + 1000 * 60 * 60 * 12
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || sign(encoded) !== signature) {
    return null;
  }

  const session = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
    email: string;
    expires: number;
  };

  if (session.expires < Date.now()) return null;
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function updateAdminPassword(password: string) {
  const settings = await readSiteSettings();
  settings.admin.passwordHash = await hashPassword(password);
  await writeSiteSettings(settings);
}
