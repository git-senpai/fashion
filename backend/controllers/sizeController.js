const asyncHandler = require("express-async-handler");
const Size = require("../models/sizeModel");

// Function to create slug from name (simple version that doesn't require slugify)
const createSlug = (name) => {
  if (!name) return "";
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

// @desc    Create a new size
// @route   POST /api/sizes
// @access  Private/Admin
const createSize = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Size name is required");
  }

  // Check if size already exists
  const sizeExists = await Size.findOne({ name });
  if (sizeExists) {
    res.status(400);
    throw new Error("Size already exists");
  }

  // Create slug from name
  const slug = createSlug(name);

  // Create size
  const size = await Size.create({
    name,
    slug,
    description,
    isActive: isActive !== undefined ? isActive : true,
  });

  if (size) {
    res.status(201).json(size);
  } else {
    res.status(400);
    throw new Error("Invalid size data");
  }
});

// @desc    Get all sizes
// @route   GET /api/sizes
// @access  Public
const getSizes = asyncHandler(async (req, res) => {
  const sizes = await Size.find({});
  res.json(sizes);
});

// @desc    Get single size
// @route   GET /api/sizes/:id
// @access  Public
const getSizeById = asyncHandler(async (req, res) => {
  const size = await Size.findById(req.params.id);
  if (size) {
    res.json(size);
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
});

// @desc    Update a size
// @route   PUT /api/sizes/:id
// @access  Private/Admin
const updateSize = asyncHandler(async (req, res) => {
  const size = await Size.findById(req.params.id);

  if (size) {
    size.name = req.body.name || size.name;
    size.description = req.body.description || size.description;
    size.isActive =
      req.body.isActive !== undefined ? req.body.isActive : size.isActive;

    const updatedSize = await size.save();
    res.json(updatedSize);
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
});

// @desc    Delete a size
// @route   DELETE /api/sizes/:id
// @access  Private/Admin
const deleteSize = asyncHandler(async (req, res) => {
  const size = await Size.findById(req.params.id);

  if (size) {
    await size.deleteOne();
    res.json({ message: "Size removed" });
  } else {
    res.status(404);
    throw new Error("Size not found");
  }
});

module.exports = {
  createSize,
  getSizes,
  getSizeById,
  updateSize,
  deleteSize,
}; 