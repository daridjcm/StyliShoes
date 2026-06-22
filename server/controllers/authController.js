import pool from "../db.js";
import jwt from 'jsonwebtoken';

const jsonResponse = (data, status = 200) => 
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export async function registerUser(req) {
  try {
    const rawText = await req.text();
    if (!rawText.trim()) {
      return jsonResponse({ error: "The request body is empty." }, 400);
    }

    let body;
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      return jsonResponse({ error: "The client did not send a valid JSON format" }, 400);
    }

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
    console.error("Error in POST /api/users:", error);
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
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.warn("Warning: Attempt to login with invalid or empty JSON.");
      return jsonResponse({ error: "The request body must be a valid JSON." }, 400);
    }

    if (!body || !body.email || !body.password) {
      return jsonResponse({ error: "The email and password are required." }, 400);
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [body.email]);

    if (rows.length === 0) {
      return jsonResponse({ error: "Invalid credentials" }, 401);
    }

    const user = rows[0];
    const isPasswordCorrect = await Bun.password.verify(body.password, user.password);

    if (!isPasswordCorrect) {
      return jsonResponse({ error: "Invalid credentials" }, 401);
    }

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