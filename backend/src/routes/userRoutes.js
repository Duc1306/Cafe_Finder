// src/routes/userRoutes.js
const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const userService = require("../services/userService");

const router = express.Router();

const multer = require("multer");
const path = require("path");

// Lấy profile của user đang đăng nhập
router.get("/profile", authMiddleware, userController.getProfile);

// Cập nhật profile
router.put("/profile", authMiddleware, userController.updateProfile);

router.get("/dashboard", authMiddleware, userController.getDashboard);

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + "_" + Date.now() + ext);
  },
});
const upload = multer({ storage });

// Route upload avatar
router.post(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "ファイルがありません。" });
    // Lưu đường dẫn vào DB
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${
      req.file.filename
    }`;

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
