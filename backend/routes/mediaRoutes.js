const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const requireRole = require("../middleware/requireRole");
const upload = require("../middleware/upload");
const { listMedia, uploadMedia, deleteMedia } = require("../controllers/mediaController");

const router = express.Router();

router.use(verifyToken);

router.get("/", listMedia);
router.post("/", requireRole(["admin", "editor"]), upload.single("file"), uploadMedia);
router.delete("/:id", isAdmin, deleteMedia);

module.exports = router;
