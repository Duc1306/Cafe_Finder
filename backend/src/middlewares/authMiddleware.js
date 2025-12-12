// src/middlewares/authMiddleware.js
// Xác thực người dùng có tồn tại không bằng JWT
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ error: "No token provided" });

    const token = header.split(" ")[1];
    

    if (!token) return res.status(401).json({ error: "Invalid token format" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // decoded chứa { id, role }

    next();
  } catch (err) {
    console.error('Auth error:', err.message); // Debug log
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware kiểm tra quyền truy cập dựa trên vai trò người dùng
const authorize = (requiredRole) => {
  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user)
        return res.status(401).json({ error: "Unauthorized" });

      if (user.role !== requiredRole)
        return res.status(403).json({ error: "Forbidden: Access denied" });

      next();
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
};

module.exports = authMiddleware;
module.exports.authorize = authorize;

