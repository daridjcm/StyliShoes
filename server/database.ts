import mysql from "mysql2/promise";
import type { ResultSetHeader } from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || "stylishoes",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/** SELECT: devuelve las filas tipadas. */
export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [rows] = await pool.execute(sql, params as any[]);
  return rows as T[];
}

/** INSERT / UPDATE / DELETE: devuelve insertId y affectedRows. */
export async function run(sql: string, params: unknown[] = []): Promise<ResultSetHeader> {
  const [result] = await pool.execute(sql, params as any[]);
  return result as ResultSetHeader;
}
