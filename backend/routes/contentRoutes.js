const express = require("express");
const verifyToken = require("../middleware/verifyToken");
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
router.post("/", createContent);
router.put("/:id", updateContent);
router.delete("/:id", deleteContent);

module.exports = router;
