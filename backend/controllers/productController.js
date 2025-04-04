const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary (assuming it's already set up in uploadController)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};

  const count = await Product.countDocuments({ ...keyword, ...category });
  const products = await Product.find({ ...keyword, ...category })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    sizeQuantities,
    discountPercentage,
    featured,
  } = req.body;

  // Calculate total countInStock from sizeQuantities
  const countInStock = Array.isArray(sizeQuantities)
    ? sizeQuantities.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    : 0;

  // Ensure discountPercentage is properly parsed as a number
  const parsedDiscountPercentage = discountPercentage !== undefined ? 
    Number(discountPercentage) : 0;

  console.log('Creating product with discount percentage:', parsedDiscountPercentage);

  const product = new Product({
    name,
    price,
    user: req.user._id,
    images,
    brand,
    category,
    countInStock,
    sizeQuantities: sizeQuantities || [],
    discountPercentage: parsedDiscountPercentage,
    numReviews: 0,
    description,
    featured: featured || false,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    images,
    brand,
    category,
    sizeQuantities,
    countInStock,
    discountPercentage,
    featured,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    // Calculate total stock from sizeQuantities
    const calculatedCountInStock = Array.isArray(sizeQuantities)
      ? sizeQuantities.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
      : countInStock || product.countInStock;

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.images = images || product.images;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = calculatedCountInStock;
    product.sizeQuantities = sizeQuantities || product.sizeQuantities;
    product.discountPercentage = discountPercentage !== undefined ? discountPercentage : product.discountPercentage;
    product.featured = featured !== undefined ? featured : product.featured;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const uploadedImageUrls = [];

  try {
    // Check if there are uploaded files
    if (req.files && req.files.length > 0) {
      // Upload each image to Cloudinary
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "fashion_ecommerce/reviews",
            width: 1200,
            crop: "limit"
          });
  
          uploadedImageUrls.push(result.secure_url);
  
          // Clean up local file after successful upload
          fs.unlinkSync(file.path);
        } catch (uploadErr) {
          console.error("Error uploading image to Cloudinary:", uploadErr);
          
          // Clean up local file if upload failed
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
    }
  
    const product = await Product.findById(req.params.id);
  
    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
  
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }
  
      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
        images: uploadedImageUrls
      };
  
      product.reviews.push(review);
  
      product.numReviews = product.reviews.length;
  
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
  
      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    // Clean up any uploaded files if they exist
    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    throw error;
  }
});

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(4);

  res.json(products);
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true }).limit(8);

  res.json(products);
});

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getFeaturedProducts,
};
