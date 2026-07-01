import mysql from "mysql2/promise";

export const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "shalimar",
  multipleStatements: false
};

export async function getDb() {
  return mysql.createConnection(dbConfig);
}

export async function query<T>(sql: string, params: unknown[] = []) {
  const connection = await getDb();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    await connection.end();
  }
}
