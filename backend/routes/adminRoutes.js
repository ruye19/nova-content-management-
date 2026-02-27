const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");
const {
  getStats,
  listUsers,
  getActivity,
  removeUser,
} = require("../controllers/adminController");

const router = express.Router();

router.use(verifyToken, isAdmin);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/activity/:id", getActivity);
router.delete("/users/:id", removeUser);

module.exports = router;
