const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const {
  listMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
} = require("../controllers/menuController");

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/", listMenus);
router.get("/:id", getMenu);
router.post("/", createMenu);
router.put("/:id", updateMenu);
router.delete("/:id", deleteMenu);

module.exports = router;

