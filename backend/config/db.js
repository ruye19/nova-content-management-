const mysql = require("mysql2/promise");

const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Missing ${key} in environment, database connection may fail.`);
  }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

module.exports = pool;
