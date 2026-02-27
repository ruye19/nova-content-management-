const pool = require("../config/db");

const formatRow = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  createdAt: row.createdAt,
  base64Data: row.data ? Buffer.from(row.data).toString("base64") : null,
});

async function listMedia(req, res) {
  try {
    const [rows] = await pool.execute("SELECT id, name, type, data, createdAt FROM Media ORDER BY createdAt DESC");
    return res.json(rows.map(formatRow));
  } catch (error) {
    console.error("listMedia", error);
    return res.status(500).json({ error: "Failed to fetch media" });
  }
}

async function uploadMedia(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO Media (name, type, data) VALUES (?, ?, ?)",
      [req.file.originalname, req.file.mimetype, req.file.buffer]
    );

    const [rows] = await pool.execute("SELECT * FROM Media WHERE id = ?", [result.insertId]);
    return res.status(201).json(formatRow(rows[0]));
  } catch (error) {
    console.error("uploadMedia", error);
    return res.status(500).json({ error: "Failed to upload media" });
  }
}

async function deleteMedia(req, res) {
  try {
    const [rows] = await pool.execute("SELECT id FROM Media WHERE id = ?", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Media not found" });
    }

    await pool.execute("DELETE FROM Media WHERE id = ?", [req.params.id]);
    return res.json({ message: "Media deleted" });
  } catch (error) {
    console.error("deleteMedia", error);
    return res.status(500).json({ error: "Failed to delete media" });
  }
}

module.exports = { listMedia, uploadMedia, deleteMedia };
