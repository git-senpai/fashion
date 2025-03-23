const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadImage, deleteImage } = require("../controllers/uploadController");
const { protect, admin } = require("../middleware/authMiddleware");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
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

// Configure error handling for multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
}).single("image");

// Middleware to handle multer errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`,
        field: err.field,
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        success: false,
        message: `Unknown error: ${err.message}`,
      });
    }
    // Everything went fine
    next();
  });
};

// Routes
router.post("/", protect, uploadMiddleware, uploadImage);
router.delete("/:public_id", protect, admin, deleteImage);

module.exports = router;
