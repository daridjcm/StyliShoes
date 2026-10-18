export interface Product {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  size: string;
  image_url: string;
}

/** Datos parciales que llegan del formulario del admin. */
export type ProductInput = {
  category?: string | null;
  name?: string | null;
  description?: string | null;
  price?: number | string | null;
  stock?: number | string | null;
  size?: string | number[] | null;
  image_url?: string | null;
};
