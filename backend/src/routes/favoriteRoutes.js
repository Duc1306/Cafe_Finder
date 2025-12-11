const express = require('express');

const router = express.Router();

const favoriteController = require('../controllers/favoriteController');

const authMiddleware = require('../middlewares/authMiddleware'); // Middleware check login



// Tất cả route này yêu cầu đăng nhập

router.use(authMiddleware);



// Lấy danh sách (Có query params: page, limit, keyword, sort...)

router.get('/', favoriteController.getList);



// Thêm/Xóa

router.post('/toggle', favoriteController.toggle);



module.exports = router;