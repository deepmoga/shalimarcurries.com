import { readFile } from "node:fs/promises";
import path from "node:path";
import { query } from "@/lib/db";

export type SiteSettings = {
  branding: {
    siteName: string;
    logo: string;
    footerLogo: string;
    favicon: string;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    facebook: string;
    instagram: string;
  };
  mail: {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    passwordEnvKey?: string;
    fromEmail: string;
    adminEmail: string;
  };
  admin: {
    email: string;
    passwordHash: string;
  };
};

const dataDirectory = path.join(process.cwd(), "data");
const settingsFile = path.join(dataDirectory, "site-settings.json");

function normalizeSettings(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    mail: {
      ...settings.mail,
      password: settings.mail.password || settings.mail.passwordEnvKey || "",
      passwordEnvKey: undefined
    }
  };
}

export async function readSiteSettings(): Promise<SiteSettings> {
  const rows = await query<{ setting_value: string }>(
    "SELECT setting_value FROM app_settings WHERE setting_key = 'site' LIMIT 1"
  ).catch(async () => []);

  if (rows[0]?.setting_value) {
    return normalizeSettings(JSON.parse(rows[0].setting_value) as SiteSettings);
  }

  const contents = await readFile(settingsFile, "utf8");
  return normalizeSettings(JSON.parse(contents) as SiteSettings);
}

export async function writeSiteSettings(settings: SiteSettings) {
  await query(
    `INSERT INTO app_settings (setting_key, setting_value)
     VALUES ('site', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [JSON.stringify(settings)]
  );
}
