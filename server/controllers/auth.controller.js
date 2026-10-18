import { HttpError, json, readJson } from "../lib/http.js";
import * as authService from "../services/auth.service.js";

const REQUIRED_REGISTER_FIELDS = ["name", "lastname", "username", "email", "password"];

export async function registerUser(req) {
  const body = await readJson(req);
  if (!body || REQUIRED_REGISTER_FIELDS.some((field) => !body[field])) {
    throw new HttpError(400, "name, lastname, username, email and password are required.");
  }

  try {
    await authService.register(body);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new HttpError(409, "The user already exists.");
    throw error;
  }
  return json({ message: "User registered successfully" }, 201);
}

export async function loginUser(req) {
  const body = await readJson(req);
  if (!body?.email || !body?.password) {
    throw new HttpError(400, "The email and password are required in a valid JSON format.");
  }

  const token = await authService.login(body.email, body.password);
  if (!token) throw new HttpError(401, "Invalid credentials");

  return json({ message: "User authenticated", token });
}
