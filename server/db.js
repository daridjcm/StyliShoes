import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'stylishoes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("¡Stylishoes DB is ready!");

export default pool;