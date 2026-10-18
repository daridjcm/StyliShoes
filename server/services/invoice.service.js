import { join } from "path";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { IMAGES_DIR } from "../lib/paths.js";

const BRAND_COLOR = "#720707";

async function addLogo(doc) {
  const logo = Bun.file(join(IMAGES_DIR, "logo/stylishoes-imagotype.png"));
  if (!(await logo.exists())) return;

  try {
    const base64 = Buffer.from(await logo.arrayBuffer()).toString("base64");
    doc.addImage(base64, "PNG", 14, 15, 75, 18);
  } catch (error) {
    console.warn("PDF logo warning:", error.message);
  }
}

/** Genera la factura en PDF de una compra y la devuelve como Buffer. */
export async function buildInvoicePdf(purchase) {
  const doc = new jsPDF();
  await addLogo(doc);

  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(BRAND_COLOR);
  doc.text("INVOICE", 200, 25, { align: "right" });
  doc.setFontSize(10).setFont("helvetica", "normal").setTextColor("#333333");
  doc.text(`Invoice ID: #${purchase.id_purchase}`, 200, 32, { align: "right" });
  doc.text(`Date: ${purchase.date.toLocaleDateString()}`, 200, 38, { align: "right" });
  doc.setFont("helvetica", "bold").text("Billed To:", 14, 55);
  doc.setFont("helvetica", "normal").text(`Customer: ${purchase.customer}`, 14, 62);

  autoTable(doc, {
    startY: 70,
    head: [["#", "Product Name", "Unit Price", "Qty", "Total"]],
    body: [["", "Item details are not stored by the current database schema", "", "", ""]],
    headStyles: { fillColor: [114, 7, 7], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10, vAlign: "middle" },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "right" },
    },
  });

  doc.setFont("helvetica", "bold").setFontSize(12);
  doc.text(`Total Amount: $${purchase.total.toFixed(2)}`, 200, doc.lastAutoTable.finalY + 10, { align: "right" });

  return Buffer.from(doc.output("arraybuffer"));
}
