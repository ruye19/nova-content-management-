const pool = require("../config/db");

function normalizeItems(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function listMenus(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, location, items, createdAt FROM Menus ORDER BY createdAt DESC"
    );
    return res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        createdAt: row.createdAt,
        items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
      }))
    );
  } catch (error) {
    console.error("listMenus", error);
    return res.status(500).json({ error: "Failed to fetch menus" });
  }
}

async function getMenu(req, res) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, location, items, createdAt FROM Menus WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Menu not found" });
    }
    const row = rows[0];
    return res.json({
      id: row.id,
      name: row.name,
      location: row.location,
      createdAt: row.createdAt,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    });
  } catch (error) {
    console.error("getMenu", error);
    return res.status(500).json({ error: "Failed to fetch menu" });
  }
}

async function createMenu(req, res) {
  const { name, location, items } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: "Name and location are required" });
  }

  const normalizedItems = normalizeItems(items);

  try {
    const [result] = await pool.execute(
      "INSERT INTO Menus (name, location, items) VALUES (?, ?, ?)",
      [name, location, JSON.stringify(normalizedItems)]
    );
    const [rows] = await pool.execute(
      "SELECT id, name, location, items, createdAt FROM Menus WHERE id = ?",
      [result.insertId]
    );
    const row = rows[0];
    return res.status(201).json({
      id: row.id,
      name: row.name,
      location: row.location,
      createdAt: row.createdAt,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    });
  } catch (error) {
    console.error("createMenu", error);
    return res.status(500).json({ error: "Failed to create menu" });
  }
}

async function updateMenu(req, res) {
  const { name, location, items } = req.body;

  try {
    const [rows] = await pool.execute("SELECT * FROM Menus WHERE id = ?", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Menu not found" });
    }
    const existing = rows[0];
    const nextName = name ?? existing.name;
    const nextLocation = location ?? existing.location;
    const nextItems =
      items !== undefined ? JSON.stringify(normalizeItems(items)) : existing.items;

    await pool.execute(
      "UPDATE Menus SET name = ?, location = ?, items = ? WHERE id = ?",
      [nextName, nextLocation, nextItems, existing.id]
    );

    const [updatedRows] = await pool.execute(
      "SELECT id, name, location, items, createdAt FROM Menus WHERE id = ?",
      [existing.id]
    );
    const row = updatedRows[0];
    return res.json({
      id: row.id,
      name: row.name,
      location: row.location,
      createdAt: row.createdAt,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    });
  } catch (error) {
    console.error("updateMenu", error);
    return res.status(500).json({ error: "Failed to update menu" });
  }
}

async function deleteMenu(req, res) {
  try {
    const [rows] = await pool.execute("SELECT id FROM Menus WHERE id = ?", [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Menu not found" });
    }

    await pool.execute("DELETE FROM Menus WHERE id = ?", [req.params.id]);
    return res.json({ message: "Menu deleted" });
  } catch (error) {
    console.error("deleteMenu", error);
    return res.status(500).json({ error: "Failed to delete menu" });
  }
}

module.exports = { listMenus, getMenu, createMenu, updateMenu, deleteMenu };

