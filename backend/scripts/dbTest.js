require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = require("../config/db");

(async () => {
  try {
    const [[row]] = await pool.query("SELECT NOW() AS now");
    console.log("Database reachable at", row.now);
    process.exit(0);
  } catch (error) {
    console.error("Database connection failed", error.message);
    process.exit(1);
  }
})();
