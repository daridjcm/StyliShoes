import { join } from "path";
import { HttpError } from "../lib/http.js";
import { IMAGES_DIR, IMAGES_URL } from "../lib/paths.js";

/**
 * Devuelve el archivo si es una imagen válida, null si el formulario no trae
 * archivo, y lanza 400 si trae algo que no es una imagen.
 */
export function pickImage(file) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new HttpError(400, "The file must be an image");
  return file;
}

/** Guarda la imagen como product_<id>.<ext> y devuelve la URL pública. */
export async function saveProductImage(productId, file) {
  const extension = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const fileName = `product_${productId}.${extension}`;
  await Bun.write(join(IMAGES_DIR, fileName), file);
  return `${IMAGES_URL}/${fileName}`;
}
