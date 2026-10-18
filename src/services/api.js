import { getToken } from './session.js';

export class ApiError extends Error {}

/** Mensaje listo para mostrar al usuario. */
export const describeError = (error) =>
  error instanceof ApiError ? error.message : 'We cannot connect to the server.';

async function request(path, { method = 'GET', json, body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  }

  const response = await fetch(path, { method, headers, body });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || `Request failed (${response.status})`);
  }
  return response;
}

const requestJson = async (path, options) => (await request(path, options)).json();
const post = (path, json) => requestJson(path, { method: 'POST', json });

// Auth y contacto
export const login = (credentials) => post('/api/login', credentials);
export const register = (data) => post('/api/register', data);
export const sendContact = (data) => post('/api/contact', data);

// Productos (create/update/delete envían FormData por la imagen)
export const getProducts = async () => (await requestJson('/api/products')).products;
export const saveProduct = (method, formData) => requestJson('/api/products', { method, body: formData });
export const deleteProduct = (id) => {
  const formData = new FormData();
  formData.append('id', id);
  return saveProduct('DELETE', formData);
};

// Compras
export const createPurchase = (order) => post('/api/purchases', order);
export const getPurchases = async (idCustomer) =>
  (await requestJson(`/api/purchases?id_customer=${idCustomer}`)).purchases;
export const getLatestPurchaseId = async (idCustomer) =>
  (await requestJson(`/api/purchases/latest?id_customer=${idCustomer}`)).id_purchase;

/** Descarga la factura en PDF de una compra. */
export async function downloadInvoice(purchaseId, idCustomer) {
  const response = await request(`/api/purchases/invoice?id=${purchaseId}&id_customer=${idCustomer}`);
  const blobUrl = URL.createObjectURL(await response.blob());
  const link = Object.assign(document.createElement('a'), { href: blobUrl, download: `invoice_${purchaseId}.pdf` });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}
