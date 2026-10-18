/** Error con código HTTP: los controladores lo lanzan y el router lo convierte en respuesta. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const json = (data, status = 200) => Response.json(data, { status });

/** Lee el body como JSON; devuelve null si está vacío o es inválido. */
export async function readJson(req) {
  try {
    const text = await req.text();
    return text.trim() ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

/** Ejecuta un controlador y traduce cualquier error a una respuesta JSON. */
export async function safely(label, handler) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error(`Error in ${label}:`, error);
    return json({ error: "Internal server error" }, 500);
  }
}
