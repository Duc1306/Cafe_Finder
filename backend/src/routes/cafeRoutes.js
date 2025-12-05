// backend/src/routes/cafeRoutes.js
const express = require('express');
const router = express.Router();
const cafeController = require('../controllers/cafeController');
// const authMiddleware = require('../middlewares/authMiddleware'); // nếu sau này cần bảo vệ

/**
 * 公開API: カフェ一覧（検索・フィルター・ページング）
 * GET /api/cafes?keyword=&city=&district=&priceMin=&priceMax=&rating=&openNow=&page=&limit=
 *
 * ※ 現時点では認証不要のPublic APIとして実装
 */
router.get('/', cafeController.listCafes);

module.exports = router;
