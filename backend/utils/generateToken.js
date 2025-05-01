const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  // Use a default secret if JWT_SECRET is not defined
  const secret =
    process.env.JWT_SECRET || "fallback_secret_for_development_only";

  if (!process.env.JWT_SECRET) {
    console.warn(
      "WARNING: JWT_SECRET is not set. Using fallback secret. This is insecure for production!"
    );
  }

  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
