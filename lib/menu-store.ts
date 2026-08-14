import { randomUUID } from "node:crypto";
import { getDb, query } from "@/lib/db";
import type { CheckoutDetails, MenuStore } from "@/lib/menu-types";

let orderSnapshotColumnReady = false;

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const defaultOpeningDays = {
  Sunday: true,
  Monday: false,
  Tuesday: true,
  Wednesday: true,
  Thursday: true,
  Friday: true,
  Saturday: true
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }
  return value as T;
}

function normalizeOrderOptions(value: unknown) {
  const options = parseJson(value, { delivery: true, pickup: true });
  return {
    delivery: options.delivery !== false,
    pickup: options.pickup !== false
  };
}

function normalizeOpeningDays(value: unknown) {
  const savedDays = parseJson<Record<string, boolean>>(value, defaultOpeningDays);
  return dayNames.reduce<Record<string, boolean>>((days, day) => {
    days[day] = savedDays[day] ?? defaultOpeningDays[day as keyof typeof defaultOpeningDays];
    return days;
  }, {});
}

function isDuplicateColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_FIELDNAME"
  );
}

async function ensureOrderSnapshotColumn() {
  if (orderSnapshotColumnReady) {
    return true;
  }

  try {
    await query("ALTER TABLE orders ADD COLUMN order_snapshot JSON NULL AFTER total");
    orderSnapshotColumnReady = true;
    return true;
  } catch (error) {
    if (isDuplicateColumnError(error)) {
      orderSnapshotColumnReady = true;
      return true;
    }
    console.error("Could not prepare order snapshot column", error);
    return false;
  }
}

export async function readMenuStore(): Promise<MenuStore> {
  try {
    const categories = await query<{
      id: string;
      name: string;
      sort_order: number;
    }>("SELECT id, name, sort_order FROM menu_categories ORDER BY sort_order, name");

    const products = await query<{
      id: string;
      category_id: string;
      name: string;
      description: string | null;
      price: string | number;
      image: string | null;
      size_options: unknown;
      spice_options: unknown;
    }>(
      "SELECT id, category_id, name, description, price, image, size_options, spice_options FROM menu_products WHERE is_active = 1 ORDER BY name"
    );

    const settings = await query<{
      suburbs: unknown;
      time_slots: unknown;
    }>("SELECT suburbs, time_slots FROM delivery_settings ORDER BY id DESC LIMIT 1");
    const orderSettings = await query<{ setting_value: unknown }>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'order_options' LIMIT 1"
    ).catch(async () => []);
    const openingSettings = await query<{ setting_value: unknown }>(
      "SELECT setting_value FROM app_settings WHERE setting_key = 'opening_days' LIMIT 1"
    ).catch(async () => []);

    return {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sort_order
      })),
      products: products.map((product) => ({
        id: product.id,
        categoryId: product.category_id,
        name: product.name,
        description: product.description ?? "",
        price: Number(product.price),
        image: product.image || "/images/butter-chicken.webp",
        sizeOptions: parseJson(product.size_options, []),
        spiceOptions: parseJson(product.spice_options, [])
      })),
      suburbs: parseJson(settings[0]?.suburbs, []),
      timeSlots: parseJson(settings[0]?.time_slots, {}),
      openingDays: normalizeOpeningDays(openingSettings[0]?.setting_value),
      orderOptions: normalizeOrderOptions(orderSettings[0]?.setting_value)
    };
  } catch (error) {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const contents = await readFile(path.join(process.cwd(), "data", "menu-store.json"), "utf8");
    const fallbackStore = JSON.parse(contents) as MenuStore;
    return {
      ...fallbackStore,
      openingDays: normalizeOpeningDays(fallbackStore.openingDays),
      orderOptions: normalizeOrderOptions(fallbackStore.orderOptions)
    };
  }
}

export async function writeMenuStore(store: MenuStore) {
  try {
    const connection = await getDb();
    try {
      await connection.beginTransaction();
      await connection.execute("DELETE FROM menu_products");
      await connection.execute("DELETE FROM menu_categories");

      for (const category of store.categories) {
        await connection.execute(
          "INSERT INTO menu_categories (id, name, sort_order) VALUES (?, ?, ?)",
          [category.id, category.name, category.sortOrder]
        );
      }

      for (const product of store.products) {
        await connection.execute(
          `INSERT INTO menu_products
            (id, category_id, name, description, price, image, size_options, spice_options, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            product.id,
            product.categoryId,
            product.name,
            product.description,
            product.price,
            product.image,
            JSON.stringify(product.sizeOptions),
            JSON.stringify(product.spiceOptions)
          ]
        );
      }

      await connection.execute("DELETE FROM delivery_settings");
      await connection.execute(
        "INSERT INTO delivery_settings (suburbs, time_slots) VALUES (?, ?)",
        [JSON.stringify(store.suburbs), JSON.stringify(store.timeSlots)]
      );
      await connection.execute(
        `INSERT INTO app_settings (setting_key, setting_value)
         VALUES ('order_options', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [JSON.stringify(store.orderOptions ?? { delivery: true, pickup: true })]
      );
      await connection.execute(
        `INSERT INTO app_settings (setting_key, setting_value)
         VALUES ('opening_days', ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [JSON.stringify(normalizeOpeningDays(store.openingDays))]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
  } catch (error) {
    const { writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    await writeFile(path.join(process.cwd(), "data", "menu-store.json"), JSON.stringify(store, null, 2));
  }
}

export async function createOrder(order: {
  details: CheckoutDetails;
  items: unknown[];
  total: number;
}) {
  const createdAt = new Date();
  const record = {
    id: randomUUID(),
    status: "new",
    createdAt: createdAt.toISOString(),
    ...order
  };
  const snapshot = {
    id: record.id,
    status: record.status,
    createdAt: record.createdAt,
    details: order.details,
    items: order.items,
    total: order.total
  };

  try {
    const hasOrderSnapshot = await ensureOrderSnapshotColumn();
    if (hasOrderSnapshot) {
      await query(
        `INSERT INTO orders
          (id, mode, customer_name, phone, address, zipcode, suburb, delivery_time, notes, items, total, order_snapshot, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          order.details.mode,
          order.details.name,
          order.details.phone,
          order.details.address,
          order.details.zipcode,
          order.details.suburb ?? "",
          order.details.time ?? "",
          order.details.notes ?? "",
          JSON.stringify(order.items),
          order.total,
          JSON.stringify(snapshot),
          record.status,
          createdAt
        ]
      );
      return record;
    }

    await query(
      `INSERT INTO orders
        (id, mode, customer_name, phone, address, zipcode, suburb, delivery_time, notes, items, total, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        order.details.mode,
        order.details.name,
        order.details.phone,
        order.details.address,
        order.details.zipcode,
        order.details.suburb ?? "",
        order.details.time ?? "",
        order.details.notes ?? "",
        JSON.stringify(order.items),
        order.total,
        record.status,
        createdAt
      ]
    );
    return record;
  } catch (error) {
    const { readFile, writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const ordersFile = path.join(process.cwd(), "data", "orders.json");
    const contents = await readFile(ordersFile, "utf8").catch(() => "[]");
    const orders = JSON.parse(contents) as any[];
    orders.unshift({ ...record, snapshot });
    await writeFile(ordersFile, JSON.stringify(orders, null, 2));
    return record;
  }
}

export async function readOrders() {
  try {
    const hasOrderSnapshot = await ensureOrderSnapshotColumn();
    const rows = await query<{
      id: string;
      mode: "delivery" | "pickup";
      customer_name: string;
      phone: string;
      address: string;
      zipcode: string;
      suburb: string | null;
      delivery_time: string | null;
      notes: string | null;
      items: unknown;
      total: string | number;
      order_snapshot?: unknown;
      status: string;
      created_at: Date | string;
    }>(
      `SELECT id, mode, customer_name, phone, address, zipcode, suburb, delivery_time, notes, items, total, ${hasOrderSnapshot ? "order_snapshot," : ""} status, created_at
       FROM orders ORDER BY created_at DESC`
    );

    return rows.map((row) => {
      const createdAt =
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
      const details = {
        mode: row.mode,
        name: row.customer_name,
        phone: row.phone,
        address: row.address,
        zipcode: row.zipcode,
        suburb: row.suburb ?? "",
        time: row.delivery_time ?? "",
        notes: row.notes ?? ""
      };
      const items = parseJson(row.items, []);
      const total = Number(row.total);

      return {
        id: row.id,
        status: row.status,
        createdAt,
        details,
        items,
        total,
        snapshot:
          parseJson(row.order_snapshot, null) ??
          {
            id: row.id,
            status: row.status,
            createdAt,
            details,
            items,
            total
          }
      };
    });
  } catch (error) {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const contents = await readFile(path.join(process.cwd(), "data", "orders.json"), "utf8").catch(() => "[]");
    return JSON.parse(contents);
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
