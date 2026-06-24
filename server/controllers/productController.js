import pool from "../db.js";
import { join } from 'path';
import { jsPDF } from 'jspdf';
import autoTable from "jspdf-autotable";

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
    const query = id ? 'SELECT * FROM products WHERE id = ?' : 'SELECT * FROM products';
    const params = id ? [id] : [];
    
    const [rows] = await pool.execute(query, params);
    
    if (!id) return jsonResponse({ products: rows });
    return rows.length ? jsonResponse({ product: rows[0] }) : jsonResponse({ error: "Product not found" }, 404);
  } catch (error) {
    console.error("Error getting product(s):", error);
    return jsonResponse({ error: "Internal server error" }, 500);
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

    if (p.imageFile?.size > 0) {
      const fileName = `product_${productId}.${p.imageFile.name.split('.').pop()}`;
      await Bun.write(getImagePath(fileName), p.imageFile);
      await pool.execute('UPDATE products SET image_url = ? WHERE id = ?', [`/src/images/${fileName}`, productId]);
    }

    await syncProductsJson();
    return jsonResponse({ message: "Product saved successfully!" }, 201);
  } catch (error) {
    console.error("Error saving product:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

export async function updateProduct(req) {
  try {
    const p = await extractProductData(req);
    if (!p.id) return jsonResponse({ error: "Missing product ID for update" }, 400);

    const [current] = await pool.execute('SELECT image_url FROM products WHERE id = ?', [p.id]);
    if (!current.length) return jsonResponse({ error: "Product not found" }, 404);
    
    let imagePath = current[0].image_url;

    if (p.imageFile?.size > 0) {
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
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

export async function deleteProduct(req) {
  try {
    const fd = await req.formData();
    const id = fd.get("id");
    if (!id) return jsonResponse({ error: "Missing product ID" }, 400);

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    await syncProductsJson();
    return jsonResponse({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}


export async function createPurchase(req) {
  const connection = await pool.getConnection();
  try {
    const { id_customer, customer, items, total } = await req.json();
    if (!id_customer || !items?.length) return jsonResponse({ error: "Missing order data" }, 400);
    
    await connection.beginTransaction();
    
    const [purchaseResult] = await connection.execute(
      "INSERT INTO purchases (id_customer, customer, total, status) VALUES (?, ?, ?, 'Approved')",
      [id_customer, customer, total]
    );
    const idPurchase = purchaseResult.insertId;
    
    const itemQueries = items.map(item => 
      connection.execute(
        "INSERT INTO purchase_items (id_purchase, id_product, product_name, price) VALUES (?, ?, ?, ?)",
        [idPurchase, item.id_product, item.name, item.price]
      )
    );
    await Promise.all(itemQueries);

    await connection.commit();
    return jsonResponse({ message: "Purchase registered successfully!", id_purchase: idPurchase }, 201);
  } catch (error) {
    await connection.rollback();
    console.error("Error creating purchase:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  } finally {
    connection.release();
  }
}

export async function getPurchases(url) {
  try {
    const id_customer = url.searchParams.get("id_customer");
    if (!id_customer) return jsonResponse({ error: "Missing id_customer parameter" }, 400);

    const [rows] = await pool.execute(`
      SELECT p.*, pi.product_name, pi.price AS item_price
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id_purchase = pi.id_purchase
      WHERE p.id_customer = ?
      ORDER BY p.date DESC
      `, [id_customer]);
      
      const purchasesMap = rows.reduce((acc, row) => {
      if (!acc[row.id_purchase]) {
        acc[row.id_purchase] = {
          id_purchase: row.id_purchase, id_customer: row.id_customer,
          customer: row.customer, total: row.total, date: row.date,
          status: row.status, items: []
        };
      }
      if (row.product_name) {
        acc[row.id_purchase].items.push({ name: row.product_name, price: row.item_price });
      }
      return acc;
    }, {});
    
    return jsonResponse({ purchases: Object.values(purchasesMap) });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

export async function getInvoicePDF(req, url) {
  let idPurchase = url.searchParams.get("id");
  const idCustomer = url.searchParams.get("id_customer");

  if (!idCustomer || !idPurchase) return jsonResponse({ error: "Missing required parameters" }, 400);

  try {
    const [rows] = await pool.execute(`
      SELECT p.id_purchase, p.customer, p.date, p.total, pi.product_name, pi.price 
      FROM purchases p
      LEFT JOIN purchase_items pi ON p.id_purchase = pi.id_purchase
      WHERE p.id_purchase = ? AND p.id_customer = ?
    `, [idPurchase, idCustomer]);

    if (!rows.length) return jsonResponse({ error: "Invoice not found or unauthorized" }, 404);

    const purchase = {
      id_purchase: rows[0].id_purchase,
      customer: rows[0].customer,
      date: rows[0].date,
      total: rows[0].total,
      items: rows.filter(r => r.product_name).map(r => ({ name: r.product_name, price: r.price }))
    };

    const doc = new jsPDF();

    // Convert image to base64
    const imageFile = Bun.file("src/images/logo/stylishoes-imagotype.png");
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    try { doc.addImage(base64Image, "PNG", 14, 15, 75, 18); } 
    catch (e) { console.warn("PDF Logo warning:", e.message); }

    doc.setFont("helvetica", "bold").setFontSize(22).setTextColor("#720707"); 
    doc.text("INVOICE", 200, 25, { align: "right" });

    doc.setFontSize(10).setFont("helvetica", "normal").setTextColor("#333333");
    doc.text(`Invoice ID: #${purchase.id_purchase}`, 200, 32, { align: "right" });
    doc.text(`Date: ${new Date(purchase.date).toLocaleDateString()}`, 200, 38, { align: "right" });

    doc.setFont("helvetica", "bold").text("Billed To:", 14, 55);
    doc.setFont("helvetica", "normal").text(`Customer: ${purchase.customer || 'Guest'}`, 14, 62);

    const itemMap = purchase.items.reduce((acc, item) => {
      if (!acc[item.name]) acc[item.name] = { name: item.name, price: Number(item.price), qty: 0 };
      acc[item.name].qty += 1;
      return acc;
    }, {});

    const tableRows = Object.values(itemMap).map((item, idx) => [
      idx + 1, item.name, `$${item.price.toFixed(2)}`, item.qty, `$${(item.price * item.qty).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['#', 'Product Name', 'Unit Price', 'Qty', 'Total']],
      body: tableRows,
      headStyles: { fillColor: [114, 7, 7], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { font: 'helvetica', fontSize: 10, vJustify: 'middle' },
      columnStyles: { 0: { cellWidth: 10 }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'right' } }
    });

    doc.setFont("helvetica", "bold").setFontSize(12);
    doc.text(`Total Amount: $${Number(purchase.total).toFixed(2)}`, 200, doc.lastAutoTable.finalY + 10, { align: "right" });

    const buffer = Buffer.from(doc.output("arraybuffer"));
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice_${idPurchase}.pdf`
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}

export async function getLatestPurchaseId(url) {
  const id_customer = url.searchParams.get("id_customer");
  const [rows] = await pool.execute(
    'SELECT id_purchase FROM purchases WHERE id_customer = ? ORDER BY date DESC LIMIT 1',
    [id_customer]
  );
  
  if (rows.length === 0) return jsonResponse({ error: "No purchases" }, 404);
  return jsonResponse({ id_purchase: rows[0].id_purchase });
}