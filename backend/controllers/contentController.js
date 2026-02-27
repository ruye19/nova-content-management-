const pool = require("../config/db");
const { slugify, ensureUniqueSlug } = require("../utils/slugify");

const isOwnerOrAdmin = (user, content) => user.role === "admin" || content.authorId === user.id;

async function listContents(req, res) {
  try {
    let query =
      "SELECT c.id, c.title, c.slug, c.body, c.status, c.authorId, c.createdAt, u.username AS authorName FROM Contents c LEFT JOIN Users u ON c.authorId = u.id";
    const params = [];
    if (req.user.role !== "admin") {
      query += " WHERE c.authorId = ?";
      params.push(req.user.id);
    }
    query += " ORDER BY c.createdAt DESC";
    const [rows] = await pool.execute(query, params);
    return res.json(rows);
  } catch (error) {
    console.error("listContents", error);
    return res.status(500).json({ error: "Failed to fetch contents" });
  }
}

async function getContent(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM Contents WHERE id = ?", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Content not found" });
    }
    const content = rows[0];
    if (!isOwnerOrAdmin(req.user, content)) {
      return res.status(403).json({ error: "Not authorized" });
    }
    return res.json(content);
  } catch (error) {
    console.error("getContent", error);
    return res.status(500).json({ error: "Failed to fetch content" });
  }
}

async function createContent(req, res) {
  const { title, body = "", status = "draft" } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const baseSlug = slugify(title);
    const uniqueSlug = await ensureUniqueSlug(pool, baseSlug);
    const [result] = await pool.execute(
      "INSERT INTO Contents (title, slug, body, status, authorId) VALUES (?, ?, ?, ?, ?)",
      [title, uniqueSlug, body, status, req.user.id]
    );

    const [rows] = await pool.execute("SELECT * FROM Contents WHERE id = ?", [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("createContent", error);
    return res.status(500).json({ error: "Failed to create content" });
  }
}

async function updateContent(req, res) {
  const { title, body, status, slug } = req.body;
  try {
    const [rows] = await pool.execute("SELECT * FROM Contents WHERE id = ?", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Content not found" });
    }
    const content = rows[0];
    if (!isOwnerOrAdmin(req.user, content)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const nextTitle = title ?? content.title;
    const nextBody = body ?? content.body;
    const nextStatus = status ?? content.status;
    const nextSlug = slug ? await ensureUniqueSlug(pool, slugify(slug), content.id) : content.slug;

    await pool.execute(
      "UPDATE Contents SET title = ?, slug = ?, body = ?, status = ? WHERE id = ?",
      [nextTitle, nextSlug, nextBody, nextStatus, content.id]
    );

    const [updated] = await pool.execute("SELECT * FROM Contents WHERE id = ?", [content.id]);
    return res.json(updated[0]);
  } catch (error) {
    console.error("updateContent", error);
    return res.status(500).json({ error: "Failed to update content" });
  }
}

async function deleteContent(req, res) {
  try {
    const [rows] = await pool.execute("SELECT authorId FROM Contents WHERE id = ?", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Content not found" });
    }
    const content = rows[0];
    if (!isOwnerOrAdmin(req.user, content)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await pool.execute("DELETE FROM Contents WHERE id = ?", [req.params.id]);
    return res.json({ message: "Content deleted" });
  } catch (error) {
    console.error("deleteContent", error);
    return res.status(500).json({ error: "Failed to delete content" });
  }
}

module.exports = { listContents, getContent, createContent, updateContent, deleteContent };
