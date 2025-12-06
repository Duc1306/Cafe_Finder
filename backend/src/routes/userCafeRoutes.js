/**
 * User Cafe Routes
 * API endpoints for customer cafe browsing, search, and favorites
 */
const express = require('express');
const userCafeController = require('../controllers/userCafeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// ==================== CAFE ROUTES (Public) ====================
// GET /api/user/cafes - Lấy danh sách quán cafe (tìm kiếm, lọc, phân trang)
router.get('/', userCafeController.getCafeList);

// GET /api/user/cafes/:id - Lấy chi tiết quán cafe
router.get('/:id', userCafeController.getCafeDetail);

// GET /api/user/cafes/:id/reviews - Lấy danh sách reviews
router.get('/:id/reviews', userCafeController.getCafeReviews);

// POST /api/user/cafes/:id/reviews - Đăng review mới (yêu cầu đăng nhập)
router.post('/:id/reviews', authMiddleware, userCafeController.createReview);

module.exports = router;
