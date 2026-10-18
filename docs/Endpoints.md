# APIs y Endpoints

Base URL: `http://localhost:3000` · Formato: JSON (los endpoints de productos reciben `multipart/form-data`).
Los errores siempre responden `{ "error": "mensaje" }`. Las rutas se declaran en una sola tabla en [`server.js`](../server.js).

## Autenticación — `server/controllers/auth.controller.js`

| Método | Ruta | Body | Respuestas |
|---|---|---|---|
| POST | `/api/register` | `{ name, lastname, username, email, password }` | `201` creado · `400` faltan campos · `409` el usuario ya existe |
| POST | `/api/login` | `{ email, password }` | `200 { message, token }` (JWT, 1 h) · `400` · `401` credenciales inválidas |

El JWT incluye `{ id, username, email, type }` donde `type` es `1` para administrador y `0` para cliente.

## Productos — `server/controllers/product.controller.js`

| Método | Ruta | Datos | Respuestas |
|---|---|---|---|
| GET | `/api/products` | — | `200 { products: [...] }` |
| GET | `/api/products?id=1` | — | `200 { product }` · `404` |
| POST | `/api/products` | form-data: `name, category, description, size, price, image?` | `201` · `400` si el archivo no es imagen |
| PUT | `/api/products` | form-data: `id` + los campos a cambiar (si no hay `image`, se conserva la actual) | `200` · `400` sin id · `404` |
| DELETE | `/api/products` | form-data: `id` | `200` · `400` sin id |

## Compras — `server/controllers/purchase.controller.js`

| Método | Ruta | Datos | Respuestas |
|---|---|---|---|
| POST | `/api/purchases` | JSON `{ id_customer, items: [...], total }` | `201 { message, id_purchase }` · `400` |
| GET | `/api/purchases?id_customer=1` | — | `200 { purchases: [...] }` · `400` |
| GET | `/api/purchases/latest?id_customer=1` | — | `200 { id_purchase }` · `404` sin compras |
| GET | `/api/purchases/invoice?id=11&id_customer=1` | — | `200` PDF (`application/pdf`) · `404` |

> El esquema actual solo guarda el encabezado de la compra (`purchases`); los `items` se validan pero no se persisten.
