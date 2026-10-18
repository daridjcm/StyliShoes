import { join, normalize } from "path";
import * as auth from "./server/controllers/auth.controller.js";
import * as products from "./server/controllers/product.controller.js";
import * as purchases from "./server/controllers/purchase.controller.js";
import { safely } from "./server/lib/http.js";
import { DIST_DIR, IMAGES_DIR, IMAGES_URL } from "./server/lib/paths.js";

const PORT = 3000;

const apiRoutes = {
  "POST /api/register": auth.registerUser,
  "POST /api/login": auth.loginUser,

  "GET /api/products": products.getProducts,
  "POST /api/products": products.createProduct,
  "PUT /api/products": products.updateProduct,
  "DELETE /api/products": products.deleteProduct,

  "POST /api/purchases": purchases.createPurchase,
  "GET /api/purchases": purchases.getPurchases,
  "GET /api/purchases/invoice": purchases.getInvoicePDF,
  "GET /api/purchases/latest": purchases.getLatestPurchaseId,
};

/** Sirve un archivo dentro de `baseDir` (nunca fuera de él). */
async function serveStatic(baseDir, relativePath) {
  const filePath = normalize(join(baseDir, relativePath));
  if (!filePath.startsWith(baseDir)) return null;

  const file = Bun.file(filePath);
  return (await file.exists()) ? new Response(file) : null;
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;

    const handler = apiRoutes[`${req.method} ${pathname}`];
    if (handler) return safely(`${req.method} ${pathname}`, () => handler(req, url));
    if (pathname.startsWith("/api/")) return Response.json({ error: "API route not found" }, { status: 404 });

    if (pathname.startsWith(`${IMAGES_URL}/`)) {
      const image = await serveStatic(IMAGES_DIR, pathname.slice(IMAGES_URL.length));
      if (image) return image;
    }

    if (pathname.startsWith("/assets/")) {
      const asset = await serveStatic(DIST_DIR, pathname);
      if (asset) return asset;
    }

    // Cualquier otra ruta es del frontend (SPA): se resuelve en el navegador.
    const index = Bun.file(join(DIST_DIR, "index.html"));
    if (await index.exists()) return new Response(index, { headers: { "Content-Type": "text/html" } });

    return new Response("Frontend not built. Run `bun run build` first.", { status: 503 });
  },
});

console.log(`Server running on http://localhost:${PORT}`);
