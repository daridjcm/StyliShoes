import { HttpError, json } from "../lib/http.js";
import { ProductRepository } from "../repositories/ProductRepo.ts";
import { pickImage, saveProductImage } from "../services/image.service.js";

async function readProductForm(req) {
  const form = await req.formData();
  return {
    id: form.get("id"),
    name: form.get("name"),
    category: form.get("category"),
    description: form.get("description"),
    size: form.get("size"),
    price: form.get("price"),
    image: pickImage(form.get("image")),
  };
}

export async function getProducts(_req, url) {
  const id = url.searchParams.get("id");
  if (!id) return json({ products: await ProductRepository.list() });

  const product = await ProductRepository.findById(id);
  if (!product) throw new HttpError(404, "Product not found");
  return json({ product });
}

export async function createProduct(req) {
  const { image, ...data } = await readProductForm(req);
  const id = await ProductRepository.create(data);

  if (image) await ProductRepository.setImage(id, await saveProductImage(id, image));
  return json({ message: "Product saved successfully!" }, 201);
}

export async function updateProduct(req) {
  const { id, image, ...data } = await readProductForm(req);
  if (!id) throw new HttpError(400, "Missing product ID for update");

  const current = await ProductRepository.findById(id);
  if (!current) throw new HttpError(404, "Product not found");

  const image_url = image ? await saveProductImage(id, image) : current.image_url;
  await ProductRepository.update(id, { ...data, image_url });
  return json({ message: "Product modified successfully!" });
}

export async function deleteProduct(req) {
  const id = (await req.formData()).get("id");
  if (!id) throw new HttpError(400, "Missing product ID");

  await ProductRepository.delete(id);
  return json({ message: "Product deleted successfully!" });
}
