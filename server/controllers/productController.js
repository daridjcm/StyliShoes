import pool from "../db.js";
import { join } from 'path';

const jsonResponse = (data, status = 200) => 
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const getImagePath = (fileName) => join(import.meta.dir, '../../src/images', fileName);

async function syncProductsJson() {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    const formattedProducts = rows.map(r => ({
      id: r.id,
      category: r.category,
      name: r.name,
      description: r.description,
      price: r.price,
      size: r.size ? r.size.split(',').map(Number) : [],
      image: r.image_url ? r.image_url.split('/').pop() : ''
    }));

    await Bun.write(join(import.meta.dir, '../../products.json'), JSON.stringify({ products: formattedProducts }, null, 2));
  } catch (error) {
    console.error("Error syncing JSON:", error);
  }
}

async function extractProductData(req) {
  const fd = await req.formData();
  return {
    id: fd.get("id"),
    name: fd.get("name"),
    category: fd.get("category"),
    description: fd.get("description"),
    size: fd.get("size"),
    price: fd.get("price"),
    imageFile: fd.get("image")
  };
}

export async function getProductById(url) {
  try {
    const id = url.searchParams.get("id");
    if (!id) {
      const [rows] = await pool.execute('SELECT * FROM products');
      return jsonResponse({ products: rows });
    }

    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows.length ? jsonResponse({ product: rows[0] }) : jsonResponse({ error: "Product not found" }, 404);
  } catch (error) {
    console.error("Error getting product:", error);
    return jsonResponse({ error: "Internal server error getting product" }, 500);
  }
}

export async function createProduct(req) {
  try {
    const p = await extractProductData(req);
    
    const [result] = await pool.execute(
      'INSERT INTO products (name, category, description, size, price, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [p.name, p.category, p.description, p.size, p.price, null]
    );

    const productId = result.insertId;

    if (p.imageFile && p.imageFile.size > 0) {
      const fileName = `product_${productId}.${p.imageFile.name.split('.').pop()}`;
      await Bun.write(getImagePath(fileName), p.imageFile);
      await pool.execute('UPDATE products SET image_url = ? WHERE id = ?', [`/src/images/${fileName}`, productId]);
    }

    await syncProductsJson();
    return jsonResponse({ message: "Product and image saved successfully!" }, 201);
  } catch (error) {
    console.error("Error saving product:", error);
    return jsonResponse({ error: "Internal server error saving product" }, 500);
  }
}

export async function updateProduct(req) {
  try {
    const p = await extractProductData(req);
    if (!p.id) return jsonResponse({ error: "Missing product ID for update" }, 400);

    const [current] = await pool.execute('SELECT image_url FROM products WHERE id = ?', [p.id]);
    if (!current.length) return jsonResponse({ error: "Product not found to update" }, 404);
    
    let imagePath = current[0].image_url;

    if (p.imageFile && p.imageFile.size > 0) {
      const fileName = `product_${p.id}.${p.imageFile.name.split('.').pop()}`;
      imagePath = `/src/images/${fileName}`;
      await Bun.write(getImagePath(fileName), p.imageFile);
    }

    await pool.execute(
      'UPDATE products SET name = ?, category = ?, description = ?, size = ?, price = ?, image_url = ? WHERE id = ?',
      [p.name, p.category, p.description, p.size, p.price, imagePath, p.id]
    );
    
    await syncProductsJson();
    return jsonResponse({ message: "Product modified successfully!" });
  } catch (error) {
    console.error("Error modifying product:", error);
    return jsonResponse({ error: "Internal server error modifying product" }, 500);
  }
}

export async function deleteProduct(req) {
  try {
    const fd = await req.formData();
    const id = fd.get("id");
    if (!id) return jsonResponse({ error: "Missing product ID for deletion" }, 400);

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    await syncProductsJson();
    return jsonResponse({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return jsonResponse({ error: "Internal server error deleting product" }, 500);
  }
}

export async function createPurchase(req) {
  const connection = await pool.getConnection();
  try {
    const { id_customer, customer, items, total } = await req.json();

    if (!id_customer || !items || !items.length) {
      return jsonResponse({ error: "Missing required order data or cart is empty" }, 400);
    }

    await connection.beginTransaction();

    const [purchaseResult] = await connection.execute(
      "INSERT INTO purchases (id_customer, customer, total, status) VALUES (?, ?, ?, 'Approved')",
      [id_customer, customer, total]
    );
    
    const idPurchase = purchaseResult.insertId;

    for (const item of items) {
      await connection.execute(
        "INSERT INTO purchase_items (id_purchase, id_product, product_name, price) VALUES (?, ?, ?, ?)",
        [idPurchase, item.id_product, item.name, item.price]
      );
    }

    await connection.commit();
    return jsonResponse({ message: "Purchase registered successfully!", id_purchase: idPurchase }, 201);

  } catch (error) {
    await connection.rollback();
    console.error("Error saving purchase transaction:", error);
    return jsonResponse({ error: "Internal server error recording purchase" }, 500);
  } finally {
    connection.release();
  }
}

export async function getPurchases(url) {
  try {
    // 1. Agregamos p.id_customer a la consulta SQL para que el frontend lo pueda pintar
    const [rows] = await pool.execute(`
      SELECT 
        p.id_purchase, 
        p.id_customer, 
        p.customer, 
        p.total, 
        p.date, 
        p.status,
        pi.product_name,
        pi.price AS item_price
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id_purchase = pi.id_purchase
      ORDER BY p.date DESC
    `);

    const purchasesMap = rows.reduce((acc, row) => {
      if (!row.id_purchase) return acc;

      if (!acc[row.id_purchase]) {
        acc[row.id_purchase] = {
          id_purchase: row.id_purchase,
          id_customer: row.id_customer, // Aseguramos que viaje el ID del cliente
          customer: row.customer,
          total: row.total,
          date: row.date,
          status: row.status,
          items: [] // Aquí se guardarán los productos
        };
      }

      // CORREGIDO: Forzamos el mapeo a la propiedad 'name' de forma clara
      if (row.product_name) {
        acc[row.id_purchase].items.push({
          name: row.product_name,
          price: row.item_price
        });
      }

      return acc;
    }, {});

    return jsonResponse({ purchases: Object.values(purchasesMap) });

  } catch (error) {
    console.error("Error getting unified purchases:", error);
    return jsonResponse({ error: "Internal server error getting purchases" }, 500);
  }
}