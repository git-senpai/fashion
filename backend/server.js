const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const sizeRoutes = require("./routes/sizeRoutes");
const addressRoutes = require("./routes/addressRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

// Load environment variables
try {
  dotenv.config();
  console.log("Environment variables loaded successfully");
} catch (error) {
  console.error("Error loading environment variables:", error);
}

const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Handle both variations of the frontend URL (with and without trailing slash)
      const allowedOrigins = [
        "https://fashion-gqwu.onrender.com",
        "https://fashion-gqwu.onrender.com/",
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!require("fs").existsSync(uploadsDir)) {
  try {
    require("fs").mkdirSync(uploadsDir, { recursive: true });
    console.log("Uploads directory created successfully");
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
}

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await connectDB();
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Retry after 5 seconds
    setTimeout(connectWithRetry, 5000);
  }
};

// Initialize MongoDB connection
connectWithRetry();

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/addresses", addressRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGO_URI ? "configured" : "not configured",
    jwtSecret: process.env.JWT_SECRET ? "configured" : "not configured",
  });
});

// Test auth endpoint with hardcoded credentials
app.post("/api/test-auth", async (req, res) => {
  try {
    const email = "admin@example.com";
    const password = "123456";

    console.log("Testing auth with:", { email, password });

    const user = await User.findOne({ email });

    if (!user) {
      console.log("Test auth failed - user not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log("Test auth failed - password doesn't match");
      return res.status(401).json({ message: "Invalid password" });
    }

    // Use the same fallback secret as in other files
    const secret =
      process.env.JWT_SECRET || "fallback_secret_for_development_only";
    const token = jwt.sign({ id: user._id }, secret, { expiresIn: "30d" });

    console.log("Test auth successful, token length:", token.length);

    return res.json({
      success: true,
      message: "Authentication successful",
      token,
    });
  } catch (error) {
    console.error("Test auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
});

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "API is running...",
    environment: process.env.NODE_ENV,
  });
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// Export the Express API
module.exports = app;
