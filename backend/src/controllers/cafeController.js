// backend/src/controllers/cafeController.js
const cafeService = require('../services/cafeService');

const cafeController = {
  /**
   * ============================================
   * GET /api/cafes?keyword=&city=&district=&priceMin=&priceMax=&rating=&openNow=&page=&limit=
   * 公開API: カフェ一覧（検索・フィルター・ページング）
   * ============================================
   */
  listCafes: async (req, res, next) => {
    try {
      const filters = {
        keyword: req.query.keyword,
        city: req.query.city,
        district: req.query.district,
        priceMin: req.query.priceMin,
        priceMax: req.query.priceMax,
        rating: req.query.rating,
        openNow: req.query.openNow,
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await cafeService.getCafeList(filters);

      // Chuẩn hóa response giống các controller khác
      return res.json({
        success: true,
        page: result.page,
        limit: result.limit,
        total: result.total,
        data: result.data
      });
    } catch (e) {
      next(e);
    }
  }
};

module.exports = cafeController;
