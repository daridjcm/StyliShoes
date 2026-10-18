import { HttpError, json } from "../lib/http.js";
import { PurchaseRepository } from "../repositories/PurchaseRepo.ts";
import { buildInvoicePdf } from "../services/invoice.service.js";

function customerIdFrom(url) {
  const idCustomer = Number(url.searchParams.get("id_customer"));
  if (!idCustomer) throw new HttpError(400, "Missing id_customer parameter");
  return idCustomer;
}

export async function createPurchase(req) {
  const { id_customer, items, total } = await req.json();
  if (!id_customer || !Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Missing order data");
  }

  const purchaseTotal = Number(total);
  if (!Number.isFinite(purchaseTotal) || purchaseTotal < 0) {
    throw new HttpError(400, "Invalid purchase total");
  }

  const id_purchase = await PurchaseRepository.create(Number(id_customer), purchaseTotal);
  return json({ message: "Purchase registered successfully!", id_purchase }, 201);
}

export async function getPurchases(_req, url) {
  const purchases = await PurchaseRepository.listByCustomer(customerIdFrom(url));
  return json({ purchases });
}

export async function getLatestPurchaseId(_req, url) {
  const id_purchase = await PurchaseRepository.latestIdByCustomer(customerIdFrom(url));
  if (id_purchase === null) throw new HttpError(404, "No purchases");
  return json({ id_purchase });
}

export async function getInvoicePDF(_req, url) {
  const idCustomer = customerIdFrom(url);
  const idPurchase = Number(url.searchParams.get("id"));
  if (!idPurchase) throw new HttpError(400, "Missing required parameters");

  const purchase = await PurchaseRepository.findForCustomer(idPurchase, idCustomer);
  if (!purchase) throw new HttpError(404, "Invoice not found or unauthorized");

  return new Response(await buildInvoicePdf(purchase), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice_${idPurchase}.pdf`,
    },
  });
}
