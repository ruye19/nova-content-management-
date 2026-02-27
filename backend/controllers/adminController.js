const pool = require("../config/db");

const allowedRoles = new Set(["admin", "editor", "user"]);

async function getStats(req, res) {
  try {
    const [[userCount]] = await pool.execute("SELECT COUNT(*) AS totalUsers FROM Users");
    const [[publishedCount]] = await pool.execute(
      "SELECT COUNT(*) AS totalPublished FROM Contents WHERE status = 'published'"
    );
    const [[mediaCount]] = await pool.execute("SELECT COUNT(*) AS totalMedia FROM Media");

    return res.json({
      totalUsers: userCount.totalUsers || 0,
      totalPublished: publishedCount.totalPublished || 0,
      totalMedia: mediaCount.totalMedia || 0,
    });
  } catch (error) {
    console.error("getStats", error);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
}

async function listUsers(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT
        u.id,
        u.username,
        u.email,
        u.role,
        u.createdAt,
        (SELECT COUNT(*) FROM Contents WHERE authorId = u.id) AS postsCount
      FROM Users u
      ORDER BY u.createdAt DESC
    `);

    return res.json(rows.map((row) => ({
      id: row.id,
      name: row.username,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
      postsCount: row.postsCount,
      mediaCount: null,
    })));
  } catch (error) {
    console.error("listUsers", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function getActivity(req, res) {
  try {
    const userId = req.params.id;
    const [[user]] = await pool.execute("SELECT id, username, email, role, createdAt FROM Users WHERE id = ?", [
      userId,
    ]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [posts] = await pool.execute(
      "SELECT id, title, status, slug, createdAt FROM Contents WHERE authorId = ? ORDER BY createdAt DESC LIMIT 20",
      [userId]
    );

    return res.json({
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      posts,
      media: [],
    });
  } catch (error) {
    console.error("getActivity", error);
    return res.status(500).json({ error: "Failed to fetch activity" });
  }
}

async function removeUser(req, res) {
  const targetId = Number(req.params.id);
  if (req.user.id === targetId) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }

  try {
    const [[user]] = await pool.execute("SELECT id FROM Users WHERE id = ?", [targetId]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.execute("DELETE FROM Users WHERE id = ?", [targetId]);
    return res.json({ message: "User deleted" });
  } catch (error) {
    console.error("removeUser", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
}

async function updateUserRole(req, res) {
  const targetId = Number(req.params.id);
  const { role } = req.body;

  if (!allowedRoles.has(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const [[target]] = await pool.execute("SELECT id, role FROM Users WHERE id = ?", [targetId]);
    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user.id === targetId && role !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own admin role" });
    }

    await pool.execute("UPDATE Users SET role = ? WHERE id = ?", [role, targetId]);
    return res.json({ message: "Role updated" });
  } catch (error) {
    console.error("updateUserRole", error);
    return res.status(500).json({ error: "Failed to update role" });
  }
}

module.exports = { getStats, listUsers, getActivity, removeUser, updateUserRole };
