const express = require("express");
const router = express.Router();
const {
  getSizes,
  getSizeById,
  createSize,
  updateSize,
  deleteSize,
} = require("../controllers/sizeController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.route("/").get(getSizes);
router.route("/:id").get(getSizeById);

// Admin routes
router.route("/").post(protect, admin, createSize);
router
  .route("/:id")
  .put(protect, admin, updateSize)
  .delete(protect, admin, deleteSize);

module.exports = router; 