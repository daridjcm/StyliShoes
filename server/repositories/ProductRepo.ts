import { query, run } from "../database";
import type { Product, ProductInput } from "../models/Product";

type ProductRow = {
  id: number;
  category: string | null;
  name: string;
  description: string;
  price: number | string;
  stock: number | string | null;
  size: string | number | null;
  image_url: string | null;
};

const SELECT = `
  SELECT p.id, c.name AS category, p.name, p.description, p.price, p.stock, p.size, p.image_url
  FROM products p
  LEFT JOIN categories c ON c.id_category = p.id_category
`;

const toProduct = (row: ProductRow): Product => ({
  id: Number(row.id),
  category: row.category ?? "",
  name: row.name,
  description: row.description,
  price: Number(row.price),
  stock: Number(row.stock ?? 0),
  size: String(row.size ?? ""),
  image_url: row.image_url ?? "",
});

const sizeToString = (size: ProductInput["size"]) => (Array.isArray(size) ? size.join(",") : size ?? "");

async function categoryId(name: string): Promise<number> {
  const rows = await query<{ id_category: number }>(
    "SELECT id_category FROM categories WHERE name = ? LIMIT 1",
    [name],
  );
  if (!rows.length) throw new Error(`Unknown product category: ${name}`);
  return Number(rows[0].id_category);
}

export const ProductRepository = {
  async list(): Promise<Product[]> {
    return (await query<ProductRow>(SELECT)).map(toProduct);
  },

  async findById(id: number | string): Promise<Product | null> {
    const rows = await query<ProductRow>(`${SELECT} WHERE p.id = ?`, [Number(id)]);
    return rows.length ? toProduct(rows[0]) : null;
  },

  async create(data: ProductInput): Promise<number> {
    const result = await run(
      `INSERT INTO products (id_category, name, description, price, stock, size, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        await categoryId(data.category ?? ""),
        data.name ?? "",
        data.description ?? "",
        Number(data.price ?? 0),
        Number(data.stock ?? 0),
        sizeToString(data.size),
        data.image_url ?? null,
      ],
    );
    return result.insertId;
  },

  /** Actualiza solo los campos recibidos; el resto conserva su valor actual. */
  async update(id: number | string, data: ProductInput): Promise<boolean> {
    const current = await this.findById(id);
    if (!current) return false;

    await run(
      `UPDATE products
       SET id_category = ?, name = ?, description = ?, price = ?, stock = ?, size = ?, image_url = ?
       WHERE id = ?`,
      [
        await categoryId(data.category ?? current.category),
        data.name ?? current.name,
        data.description ?? current.description,
        Number(data.price ?? current.price),
        Number(data.stock ?? current.stock),
        sizeToString(data.size ?? current.size),
        data.image_url ?? current.image_url,
        Number(id),
      ],
    );
    return true;
  },

  async setImage(id: number | string, imageUrl: string): Promise<void> {
    await run("UPDATE products SET image_url = ? WHERE id = ?", [imageUrl, Number(id)]);
  },

  async delete(id: number | string): Promise<boolean> {
    const result = await run("DELETE FROM products WHERE id = ?", [Number(id)]);
    return result.affectedRows > 0;
  },
};
