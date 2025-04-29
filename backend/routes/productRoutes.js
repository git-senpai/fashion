const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for review image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `review-${Date.now()}-${Math.round(Math.random() * 1000)}${path.extname(
        file.originalname
      )}`
    );
  },
});

function fileFilter(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
}

// Configure multer for multiple images
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

// Middleware to handle multer errors for review images
const uploadReviewImages = (req, res, next) => {
  const uploadMultiple = upload.array("images", 5); // Allow up to 5 images

  uploadMultiple(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        message: `Multer error: ${err.message}`,
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        message: `Unknown error: ${err.message}`,
      });
    }
    // Everything went fine
    next();
  });
};

// Public routes
router.route("/").get(getProducts).post(protect, admin, createProduct);

router.get("/top", getTopProducts);
router.get("/featured", getFeaturedProducts);

router
  .route("/:id")
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

router
  .route("/:id/reviews")
  .post(protect, uploadReviewImages, createProductReview);

module.exports = router;
