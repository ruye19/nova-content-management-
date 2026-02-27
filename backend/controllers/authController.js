const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const TOKEN_EXPIRY = "7d";

const buildUserPayload = (row) => ({
  id: row.id,
  name: row.username,
  email: row.email,
  role: row.role,
});

const issueToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

async function register(req, res) {
  const { username = "", email, password } = req.body;

  if (!username.trim() || !email || !password) {
    return res.status(400).json({ error: "Username, email and password are required" });
  }

  try {
    const [existing] = await pool.execute("SELECT id FROM Users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      "INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, 'user')",
      [username.trim(), email, hashed]
    );

    return res.status(201).json({ message: "Account created" });
  } catch (error) {
    console.error("register", error);
    return res.status(500).json({ error: "Failed to register" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await pool.execute("SELECT * FROM Users WHERE email = ?", [email]);
    if (!rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = issueToken(user);
    return res.json({ user: buildUserPayload(user), token });
  } catch (error) {
    console.error("login", error);
    return res.status(500).json({ error: "Failed to login" });
  }
}

async function me(req, res) {
  try {
    const [rows] = await pool.execute("SELECT id, username, email, role FROM Users WHERE id = ?", [req.user.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: rows[0] });
  } catch (error) {
    console.error("me", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
}

module.exports = { register, login, me };
