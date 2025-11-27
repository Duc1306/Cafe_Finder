const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authMiddleware");

// 🔐 認証関連
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/logout", authController.logout);

// 🧑‍💼 OWNER 専用ダッシュボード
router.get(
  "/owner/dashboard",
  authMiddleware,
  authorize("OWNER"),
  (req, res) => {
    res.json({ message: "オーナーダッシュボードへようこそ。" });
  }
);

// 👨‍💼 ADMIN ユーザー管理ページ
router.get(
  "/admin/users",
  authMiddleware,
  authorize("ADMIN"),
  (req, res) => {
    res.json({ message: "管理者ページです。" });
  }
);

// 👤 CUSTOMER 専用ページ
router.get(
  "/customer",
  authMiddleware,
  authorize("CUSTOMER"),
  (req, res) => {
    res.json({ message: "カスタマーページへようこそ。" });
  }
);

module.exports = router;
