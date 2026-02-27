const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");
const { listMedia, uploadMedia, deleteMedia } = require("../controllers/mediaController");

const router = express.Router();

router.use(verifyToken);

router.get("/", listMedia);
router.post("/", upload.single("file"), uploadMedia);
router.delete("/:id", isAdmin, deleteMedia);

module.exports = router;
