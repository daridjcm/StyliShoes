import pool from "../db.js";
import { join } from 'path';

const jsonResponse = (data, status = 200) => 
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

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
    console.error("Error syncing JSON:", error);
  }
}

export async function getProductById(url) {
  try {
    const id = url.searchParams.get("id");

    if (id) {
      const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
      if (rows.length === 0) {
        return jsonResponse({ error: "Product not found" }, 404);
      }
      return jsonResponse({ product: rows[0] });
    } else {
      const [rows] = await pool.execute('SELECT * FROM products');
      return jsonResponse({ products: rows });
    }
  } catch (error) {
    console.error("Error getting product:", error);
    return jsonResponse({ error: "Internal server error getting product" }, 500);
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

    return jsonResponse({ message: "Product and image saved successfully!" }, 201);
  } catch (error) {
    console.error("Error saving product:", error);
    return jsonResponse({ error: "Internal server error saving product" }, 500);
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

    if (!id) {
      return jsonResponse({ error: "Missing product ID for update" }, 400);
    }

    const [current] = await pool.execute('SELECT image_url FROM products WHERE id = ?', [id]);
    if (current.length === 0) {
      return jsonResponse({ error: "Product not found to update" }, 404);
    }
    
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

    return jsonResponse({ message: "Product modified successfully!" });
  } catch (error) {
    console.error("Error modifying product:", error);
    return jsonResponse({ error: "Internal server error modifying product" }, 500);
  }
}

export async function deleteProduct(req) {
  try {
    const formData = await req.formData();
    const id = formData.get("id");

    if (!id) {
      return jsonResponse({ error: "Missing product ID for deletion" }, 400);
    }

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    
    await syncProductsJson();

    return jsonResponse({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return jsonResponse({ error: "Internal server error deleting product" }, 500);
  }
}