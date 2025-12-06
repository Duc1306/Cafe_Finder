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
router.get('/cafes', userCafeController.getCafeList);

// GET /api/user/cafes/:id - Lấy chi tiết quán cafe
router.get('/cafes/:id', userCafeController.getCafeDetail);

// GET /api/user/cafes/:id/reviews - Lấy danh sách reviews
router.get('/cafes/:id/reviews', userCafeController.getCafeReviews);

// POST /api/user/cafes/:id/reviews - Đăng review mới (yêu cầu đăng nhập)
router.post('/cafes/:id/reviews', authMiddleware, userCafeController.createReview);

// ==================== FAVORITES ROUTES (Protected) ====================
// GET /api/user/favorites - Lấy danh sách quán yêu thích
router.get('/favorites', authMiddleware, userCafeController.getUserFavorites);

// POST /api/user/favorites - Thêm quán vào yêu thích
router.post('/favorites', authMiddleware, userCafeController.addFavorite);

// DELETE /api/user/favorites/:cafeId - Xóa quán khỏi yêu thích
router.delete('/favorites/:cafeId', authMiddleware, userCafeController.removeFavorite);

module.exports = router;
