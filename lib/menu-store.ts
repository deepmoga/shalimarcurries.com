import { randomUUID } from "node:crypto";
import { getDb, query } from "@/lib/db";
import type { CheckoutDetails, MenuStore } from "@/lib/menu-types";

export async function readMenuStore(): Promise<MenuStore> {
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
    size_options: string | null;
    spice_options: string | null;
  }>(
    "SELECT id, category_id, name, description, price, image, size_options, spice_options FROM menu_products WHERE is_active = 1 ORDER BY name"
  );

  const settings = await query<{
    suburbs: string | null;
    time_slots: string | null;
  }>("SELECT suburbs, time_slots FROM delivery_settings ORDER BY id DESC LIMIT 1");

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
      sizeOptions: product.size_options ? JSON.parse(product.size_options) : [],
      spiceOptions: product.spice_options ? JSON.parse(product.spice_options) : []
    })),
    suburbs: settings[0]?.suburbs ? JSON.parse(settings[0].suburbs) : [],
    timeSlots: settings[0]?.time_slots ? JSON.parse(settings[0].time_slots) : {}
  };
}

export async function writeMenuStore(store: MenuStore) {
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
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

export async function createOrder(order: {
  details: CheckoutDetails;
  items: unknown[];
  total: number;
}) {
  const record = {
    id: randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
    ...order
  };
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
      record.createdAt
    ]
  );
  return record;
}

export async function readOrders() {
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
    items: string;
    total: string | number;
    status: string;
    created_at: Date | string;
  }>(
    `SELECT id, mode, customer_name, phone, address, zipcode, suburb, delivery_time, notes, items, total, status, created_at
     FROM orders ORDER BY created_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    details: {
      mode: row.mode,
      name: row.customer_name,
      phone: row.phone,
      address: row.address,
      zipcode: row.zipcode,
      suburb: row.suburb ?? "",
      time: row.delivery_time ?? "",
      notes: row.notes ?? ""
    },
    items: JSON.parse(row.items),
    total: Number(row.total)
  }));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
