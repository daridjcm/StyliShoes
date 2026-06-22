import pool from "../db.js";
import jwt from 'jsonwebtoken';

const jsonResponse = (data, status = 200) => 
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

// Helper para parsear JSON de forma segura y evitar repetir try/catch
async function parseBody(req) {
  try {
    const text = await req.text();
    return text.trim() ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function registerUser(req) {
  const body = await parseBody(req);
  if (!body) return jsonResponse({ error: "The request body must be a valid, non-empty JSON." }, 400);

  try {
    const hashedPassword = await Bun.password.hash(body.password);
    await pool.execute(
      'INSERT INTO users (name, lastname, username, email, password) VALUES (?, ?, ?, ?, ?)',
      [body.name, body.lastname, body.username, body.email, hashedPassword]
    );
    return jsonResponse({ message: "User registered successfully" }, 201);
  } catch (error) {
    console.error("Error in register:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

export async function saveUser(req) {
  try {
    const body = await req.json();
    const hashedPassword = await Bun.password.hash(body.password);
    
    await pool.execute(
      'INSERT INTO users (name, lastname, email, password) VALUES (?, ?, ?, ?)',
      [body.name, body.lastname, body.email, hashedPassword]
    );
    return jsonResponse({ message: "User saved successfully" }, 201);
  } catch (error) {
    console.error("Error to save in the database:", error);
    return jsonResponse({ error: "Error to save in the database" }, 500);
  }
}

export async function getUsers() {
  try {
    const [rows] = await pool.execute('SELECT * FROM users');
    return jsonResponse(rows);
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return jsonResponse({ error: "Error to consult the database" }, 500);
  }
}

export async function loginUser(req) {
  const body = await parseBody(req);
  if (!body || !body.email || !body.password) {
    return jsonResponse({ error: "The email and password are required in a valid JSON format." }, 400);
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [body.email]);
    if (!rows.length || !(await Bun.password.verify(body.password, rows[0].password))) {
      return jsonResponse({ error: "Invalid credentials" }, 401);
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, type: user.admin }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return jsonResponse({ message: "User authenticated", token });
  } catch (error) {
    console.error("Error critical in POST /api/login:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}