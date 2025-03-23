const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Print configuration for debugging
console.log("Cloudinary Config Check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key_length: process.env.CLOUDINARY_API_KEY
    ? process.env.CLOUDINARY_API_KEY.length
    : 0,
  api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "No file uploaded. Please upload an image with the field name 'image'.",
      });
    }

    console.log("File received:", req.file);

    // Verify Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary configuration missing");
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "fashion_ecommerce",
      width: 600,
      crop: "scale",
    });

    console.log("Cloudinary upload successful:", result.secure_url);

    // Clean up local file after successful upload
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      image: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up local file if it exists and upload failed
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: `Image upload failed: ${error.message}`,
    });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private/Admin
const deleteImage = asyncHandler(async (req, res) => {
  const { public_id } = req.params;

  try {
    // Verify Cloudinary configuration
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error("Cloudinary configuration missing");
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "ok") {
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      throw new Error("Failed to delete image from Cloudinary");
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: `Image deletion failed: ${error.message}`,
    });
  }
});

module.exports = { uploadImage, deleteImage };
