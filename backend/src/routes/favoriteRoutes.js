const express = require('express');

const router = express.Router();

const favoriteController = require('../controllers/favoriteController');

const authMiddleware = require('../middlewares/authMiddleware'); // Middleware check login



// Tất cả route này yêu cầu đăng nhập

router.use(authMiddleware);



// Lấy danh sách (Có query params: page, limit, keyword, sort...)

router.get('/', favoriteController.getList);

// Thêm/Xóa toggle (giữ lại cho backward compatibility)
router.post('/toggle', favoriteController.toggle);

// POST /api/user/favorites - Thêm vào yêu thích
router.post('/', favoriteController.add);

// DELETE /api/user/favorites/:cafeId - Xóa khỏi yêu thích
router.delete('/:cafeId', favoriteController.remove);



module.exports = router;