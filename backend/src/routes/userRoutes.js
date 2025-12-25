// src/routes/userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const userService = require("../services/userService");

const router = express.Router();

const multer = require("multer");
const path = require("path");
const { avatarStorage } = require("../config/cloudinary");

// Lấy profile của user đang đăng nhập
router.get("/profile", authMiddleware, userController.getProfile);

// Cập nhật profile
router.put("/profile", authMiddleware, userController.updateProfile);

// Lấy danh sách review của user đang đăng nhập
router.get("/reviews", authMiddleware, userController.getUserReviews);

// Update review (chỉ owner)
router.put("/reviews/:id", authMiddleware, userController.updateReview);

// Delete review (chỉ owner)
router.delete("/reviews/:id", authMiddleware, userController.deleteReview);

// Dashboard
router.get("/dashboard", authMiddleware, userController.getDashboard);

// Check if we're using Cloudinary or local storage
const useCloudinary = process.env.NODE_ENV === 'production' || process.env.USE_CLOUDINARY === 'true';

let upload;

if (useCloudinary) {
  // Use Cloudinary for production
  upload = multer({ 
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  });
} else {
  // Use local storage for development
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/avatars/");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, req.user.id + "_" + Date.now() + ext);
    },
  });
  upload = multer({ storage });
}

// Route upload avatar
router.post(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "ファイルがありません。" });
    
    // Get avatar URL - different for Cloudinary vs local
    let avatarUrl;
    if (useCloudinary) {
      // Cloudinary returns full URL in req.file.path
      avatarUrl = req.file.path;
    } else {
      // Local storage needs to construct URL
      avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
    }

    await userService.updateUser(req.user.id, {
      avatar_url: avatarUrl,
    });
    res.json({ success: true, avatar_url: avatarUrl });
  }
);

// Define routes
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;