import { query, run } from "../database";
import type { Purchase, PurchaseStatus } from "../models/Purchase";

type PurchaseRow = {
  id_purchase: number;
  id_customer: number;
  total: number | string;
  date: Date | string;
  status: PurchaseStatus;
  customer: string | null;
};

const SELECT = `
  SELECT p.id_purchase, p.id_customer, p.total, p.date, p.status,
         COALESCE(NULLIF(CONCAT_WS(' ', NULLIF(u.name, ''), NULLIF(u.lastname, '')), ''), u.username, 'Customer') AS customer
  FROM purchases p
  LEFT JOIN users u ON u.id = p.id_customer
`;

const toPurchase = (row: PurchaseRow): Purchase => ({
  id_purchase: Number(row.id_purchase),
  id_customer: Number(row.id_customer),
  customer: row.customer ?? "Customer",
  total: Number(row.total),
  date: new Date(row.date),
  status: row.status,
  items: [],
});

export const PurchaseRepository = {
  async create(idCustomer: number, total: number): Promise<number> {
    const result = await run(
      "INSERT INTO purchases (id_customer, total, status) VALUES (?, ?, 'Approved')",
      [idCustomer, total],
    );
    return result.insertId;
  },

  async listByCustomer(idCustomer: number): Promise<Purchase[]> {
    const rows = await query<PurchaseRow>(`${SELECT} WHERE p.id_customer = ? ORDER BY p.date DESC`, [idCustomer]);
    return rows.map(toPurchase);
  },

  async findForCustomer(idPurchase: number, idCustomer: number): Promise<Purchase | null> {
    const rows = await query<PurchaseRow>(
      `${SELECT} WHERE p.id_purchase = ? AND p.id_customer = ?`,
      [idPurchase, idCustomer],
    );
    return rows.length ? toPurchase(rows[0]) : null;
  },

  async latestIdByCustomer(idCustomer: number): Promise<number | null> {
    const rows = await query<{ id_purchase: number }>(
      "SELECT id_purchase FROM purchases WHERE id_customer = ? ORDER BY date DESC LIMIT 1",
      [idCustomer],
    );
    return rows.length ? Number(rows[0].id_purchase) : null;
  },
};
