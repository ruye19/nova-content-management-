require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const bcrypt = require("bcrypt");
const pool = require("../config/db");

(async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@nova.local";
    const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
    const adminUsername = process.env.ADMIN_USERNAME || "Admin";

    const [existing] = await pool.execute("SELECT id FROM Users WHERE email = ?", [adminEmail]);
    if (existing.length) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashed = await bcrypt.hash(adminPassword, 10);
    await pool.execute(
      "INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, 'admin')",
      [adminUsername, adminEmail, hashed]
    );

    console.log("Admin user created");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed", error);
    process.exit(1);
  }
})();
