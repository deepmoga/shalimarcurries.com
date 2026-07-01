import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import mysql from "mysql2/promise";

const csvPath =
  process.argv[2] || "C:/Users/Rana Brar/Downloads/wc-product-export-1-7-2026-1782898030369.csv";

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "shalimar",
  multipleStatements: true
};

const defaultTimeSlots = {
  Sunday: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"],
  Monday: ["17:00", "17:30", "18:00", "18:30", "19:00"],
  Tuesday: ["17:00", "17:30", "18:00", "18:30", "19:00"],
  Wednesday: ["17:00", "17:30", "18:00", "18:30", "19:00"],
  Thursday: ["17:00", "17:30", "18:00", "18:30", "19:00"],
  Friday: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
  Saturday: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"]
};

const defaultSettings = JSON.parse(
  await readFile(path.join(process.cwd(), "data", "site-settings.json"), "utf8")
);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function splitCategories(value) {
  return String(value || "Uncategorized")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function imageFromRow(row, categoryName) {
  const firstImage = String(row.Images || "")
    .split(",")
    .map((item) => item.trim())
    .find(Boolean);

  if (firstImage) return firstImage;

  const lower = categoryName.toLowerCase();
  if (lower.includes("bread") || lower.includes("naan")) return "/images/garlic-naan.webp";
  if (lower.includes("chicken")) return "/images/butter-chicken.webp";
  if (lower.includes("lamb") || lower.includes("beef")) return "/images/lamb-rogan-josh.webp";
  if (lower.includes("rice") || lower.includes("biryani")) return "/images/hyderabadi-biryani.webp";
  if (lower.includes("vegetarian") || lower.includes("paneer")) return "/images/palak-paneer.webp";
  return "/images/restaurant-spread.webp";
}

function spiceOptionsFor(categoryName, productName) {
  const value = `${categoryName} ${productName}`.toLowerCase();
  if (
    value.includes("curry") ||
    value.includes("chicken") ||
    value.includes("lamb") ||
    value.includes("beef") ||
    value.includes("paneer") ||
    value.includes("vindaloo") ||
    value.includes("masala")
  ) {
    return ["Sweet", "Mild", "Medium", "Hot", "Extra Hot"];
  }
  return [];
}

function sizeOptionsFor(categoryName) {
  const lower = categoryName.toLowerCase();
  if (lower.includes("bread") || lower.includes("naan")) {
    return [
      { name: "Small", extra: 0 },
      { name: "Large", extra: 2.8 }
    ];
  }
  return [];
}

async function createTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id VARCHAR(80) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS menu_products (
      id VARCHAR(80) PRIMARY KEY,
      category_id VARCHAR(80) NOT NULL,
      name VARCHAR(180) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image VARCHAR(500),
      size_options JSON,
      spice_options JSON,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES menu_categories(id)
    );

    CREATE TABLE IF NOT EXISTS delivery_settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      suburbs JSON NOT NULL,
      time_slots JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(80) PRIMARY KEY,
      mode ENUM('delivery', 'pickup') NOT NULL,
      customer_name VARCHAR(180) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      address VARCHAR(255),
      zipcode VARCHAR(20),
      suburb VARCHAR(120),
      delivery_time VARCHAR(40),
      notes TEXT,
      items JSON NOT NULL,
      total DECIMAL(10,2) NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      setting_key VARCHAR(80) PRIMARY KEY,
      setting_value JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
}

const csv = await readFile(csvPath, "utf8");
const rows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  bom: true
}).filter((row) => String(row.Published || "1") === "1");

const categoryMap = new Map();
for (const row of rows) {
  for (const categoryName of splitCategories(row.Categories)) {
    const id = slugify(categoryName);
    if (!categoryMap.has(id)) {
      categoryMap.set(id, { id, name: categoryName, sortOrder: categoryMap.size + 1 });
    }
  }
}

const connection = await mysql.createConnection(connectionConfig);

try {
  await createTables(connection);
  await connection.beginTransaction();
  await connection.execute("DELETE FROM menu_products");
  await connection.execute("DELETE FROM menu_categories");

  for (const category of categoryMap.values()) {
    await connection.execute(
      "INSERT INTO menu_categories (id, name, sort_order) VALUES (?, ?, ?)",
      [category.id, category.name, category.sortOrder]
    );
  }

  let productCount = 0;
  for (const row of rows) {
    const primaryCategory = splitCategories(row.Categories)[0] || "Uncategorized";
    const categoryId = slugify(primaryCategory);
    const regularPrice = Number(row["Regular price"] || row["Sale price"] || 0);
    if (!row.Name || !regularPrice) continue;

    const productId = slugify(`${row.ID || productCount}-${row.Name}`);
    await connection.execute(
      `INSERT INTO menu_products
        (id, category_id, name, description, price, image, size_options, spice_options, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        productId,
        categoryId,
        row.Name,
        row["Short description"] || row.Description || "",
        regularPrice,
        imageFromRow(row, primaryCategory),
        JSON.stringify(sizeOptionsFor(primaryCategory)),
        JSON.stringify(spiceOptionsFor(primaryCategory, row.Name))
      ]
    );
    productCount += 1;
  }

  await connection.execute("DELETE FROM delivery_settings");
  await connection.execute(
    "INSERT INTO delivery_settings (suburbs, time_slots) VALUES (?, ?)",
    [
      JSON.stringify(["Wembley", "Subiaco", "West Leederville", "Floreat"]),
      JSON.stringify(defaultTimeSlots)
    ]
  );

  await connection.execute(
    `INSERT INTO app_settings (setting_key, setting_value)
     VALUES ('site', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [JSON.stringify(defaultSettings)]
  );

  await connection.commit();
  console.log(`Imported ${productCount} products across ${categoryMap.size} categories.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
