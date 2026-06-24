import { join } from 'path';
import * as auth from './server/controllers/authController.js';
import * as products from './server/controllers/productController.js';

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // API AUTH
    if (method === "POST" && path === "/api/register") return auth.registerUser(req);
    if (method === "POST" && path === "/api/users")    return auth.saveUser(req);
    if (method === "GET"  && path === "/api/users")    return auth.getUsers();
    if (method === "POST" && path === "/api/login")    return auth.loginUser(req);

    // API CRUD PRODUCTS  
    if (method === "POST"   && path === "/api/products") return products.createProduct(req);
    if (method === "GET"    && path === "/api/products") return products.getProductById(url);
    if (method === "PUT"    && path === "/api/products") return products.updateProduct(req);
    if (method === "DELETE" && path === "/api/products") return products.deleteProduct(req);
    if (method === "POST"   && path === "/api/purchases") return products.createPurchase(req);
    if (method === "GET"    && path === "/api/purchases") return products.getPurchases(url);
    if (method === "GET"    && path === "/api/purchases/invoice") return products.getInvoicePDF(req, url);
    if (method === "GET"    && path === "/api/purchases/latest") return products.getLatestPurchaseId(url);
    
    // FRONTEND ROUTES
    if (path === '/' || path === '/index.html') {
      const filePath = join(import.meta.dir, 'index.html');
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file, { headers: { "Content-Type": "text/html" } });
      }
      return new Response('index.html not found en la raíz', { status: 404 });
    }

    if (path === '/products.html') {
      const filePath = join(import.meta.dir, 'products.html');
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file, { headers: { "Content-Type": "text/html" } });
      }
    }
    
    if (path.startsWith('/src/')) {
      const filePath = join(import.meta.dir, path);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
    }

    if (path.startsWith('/server/')) {
      const filePath = join(import.meta.dir, path);
      
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file, { headers: { "Content-Type": "application/javascript" } });
      }
      console.log('File not found:', filePath);
    }
    
    console.log(`Route not found: ${path}`);
    return new Response('404 Not Found - File not found', { status: 404 });
  },
});

console.log('Server running on http://localhost:3000');