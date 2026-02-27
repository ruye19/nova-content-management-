const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const requireRole = require("../middleware/requireRole");
const {
  listContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
} = require("../controllers/contentController");

const router = express.Router();

router.use(verifyToken);

router.get("/", listContents);
router.get("/:id", getContent);
router.post("/", requireRole(["admin", "editor"]), createContent);
router.put("/:id", requireRole(["admin", "editor"]), updateContent);
router.delete("/:id", requireRole(["admin", "editor"]), deleteContent);

module.exports = router;
