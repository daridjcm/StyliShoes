export type PurchaseStatus = "Approved" | "Canceled";

export interface Purchase {
  id_purchase: number;
  id_customer: number;
  customer: string;
  total: number;
  date: Date;
  status: PurchaseStatus;
  /** El esquema actual no guarda el detalle de la compra, por eso siempre va vacío. */
  items: [];
}
