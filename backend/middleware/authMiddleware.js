const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// Protect routes - must be authenticated
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Use the same fallback secret as in generateToken
      const secret =
        process.env.JWT_SECRET || "fallback_secret_for_development_only";

      // Verify token
      const decoded = jwt.verify(token, secret);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.error(`User not found for id: ${decoded.id}`);
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    console.error(
      "No bearer token in authorization header:",
      req.headers.authorization
    );
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin === true) {
    console.log(`Admin access granted to: ${req.user.name} (${req.user._id})`);
    next();
  } else {
    console.error("Admin access denied:", {
      userId: req.user ? req.user._id : "No user",
      name: req.user ? req.user.name : "No user",
      isAdmin: req.user ? req.user.isAdmin : false,
    });
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

module.exports = { protect, admin };
