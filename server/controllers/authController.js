import mysql from "mysql2/promise";
import { join } from 'path';

const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'stylishoes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const jsonHeaders = { "Content-Type": "application/json" };

async function syncProductsJson() {
  try {
    const [rows] = await pool.execute('SELECT * FROM products');
    const formattedProducts = rows.map(row => ({
      id: row.id,
      category: row.category,
      name: row.name,
      description: row.description,
      price: row.price,
      size: row.size ? row.size.split(',').map(Number) : [],
      image: row.image_url ? row.image_url.split('/').pop() : ''
    }));

    const filePath = join(import.meta.dir, '../../products.json');
    await Bun.write(filePath, JSON.stringify({ products: formattedProducts }, null, 2));
  } catch (error) {
    console.error(error);
  }
}

export async function getProductById(url) {
  try {
    const id = url.searchParams.get("id");

    if (id) {
      const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Product not found" }), { status: 404, headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ product: rows[0] }), { status: 200, headers: jsonHeaders });
    } else {
      const [rows] = await pool.execute('SELECT * FROM products');
      return new Response(JSON.stringify({ products: rows }), { status: 200, headers: jsonHeaders });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: jsonHeaders });
  }
}

export async function createProduct(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const category = formData.get("category");
    const description = formData.get("description");
    const size = formData.get("size");
    const price = formData.get("price");
    const imageFile = formData.get("image");
    let imagePath = null;

    if (imageFile && imageFile.size > 0) {
      const extension = imageFile.name.split('.').pop();
      const fileName = `product_${Date.now()}.${extension}`;
      imagePath = `/src/images/${fileName}`;
      await Bun.write(join(import.meta.dir, '../../', imagePath), imageFile);
    }

    await pool.execute(
      'INSERT INTO products (name, category, description, size, price, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, description, size, price, imagePath]
    );

    await syncProductsJson();

    return new Response(JSON.stringify({ message: "Product saved successfully!" }), { status: 201, headers: jsonHeaders });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: jsonHeaders });
  }
}

export async function updateProduct(req) {
  try {
    const formData = await req.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const category = formData.get("category");
    const description = formData.get("description");
    const size = formData.get("size");
    const price = formData.get("price");
    const imageFile = formData.get("image");

    if (!id) return new Response(JSON.stringify({ error: "Missing product ID" }), { status: 400, headers: jsonHeaders });

    const [current] = await pool.execute('SELECT image_url FROM products WHERE id = ?', [id]);
    if (current.length === 0) return new Response(JSON.stringify({ error: "Product not found" }), { status: 404, headers: jsonHeaders });
    
    let imagePath = current[0].image_url;

    if (imageFile && imageFile.size > 0) {
      const extension = imageFile.name.split('.').pop();
      const fileName = `product_${Date.now()}.${extension}`;
      imagePath = `/src/images/${fileName}`;
      await Bun.write(join(import.meta.dir, '../../', imagePath), imageFile);
    }

    await pool.execute(
      'UPDATE products SET name = ?, category = ?, description = ?, size = ?, price = ?, image_url = ? WHERE id = ?',
      [name, category, description, size, price, imagePath, id]
    );

    await syncProductsJson();

    return new Response(JSON.stringify({ message: "Product modified successfully!" }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: jsonHeaders });
  }
}

export async function deleteProduct(req) {
  try {
    const formData = await req.formData();
    const id = formData.get("id");

    if (!id) return new Response(JSON.stringify({ error: "Missing product ID" }), { status: 400, headers: jsonHeaders });

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    await syncProductsJson();

    return new Response(JSON.stringify({ message: "Product deleted successfully!" }), { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: jsonHeaders });
  }
}