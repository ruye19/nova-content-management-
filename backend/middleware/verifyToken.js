const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      "SELECT id, username, email, role FROM Users WHERE id = ?",
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = {
      id: rows[0].id,
      name: rows[0].username,
      email: rows[0].email,
      role: rows[0].role,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = verifyToken;
