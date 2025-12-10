const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/authMiddleware");

const adminStatsController = require("../controllers/adminStatsController");

// Tất cả thống kê yêu cầu quyền Admin
router.use(authMiddleware);
router.use(authorize("ADMIN"));

// 📌 GET /api/admin/stats/cafes/count
router.get("/cafes/count", adminStatsController.getCafeCount);
router.get("/reviews/count", adminStatsController.getReviewCount); 

module.exports = router;
