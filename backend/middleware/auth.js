const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware — verifies JWT token from Authorization header or cookie.
 * Attaches req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Fallback to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Access denied. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token. Please log in." });
  }
};

/**
 * Optional auth — attaches user if valid token present, but doesn't block if missing.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    if (!token && req.cookies?.token) token = req.cookies.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
    next();
  } catch {
    next(); // silently ignore invalid tokens
  }
};

module.exports = { protect, optionalAuth };
