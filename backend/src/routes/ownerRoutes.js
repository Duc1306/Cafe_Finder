const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * GET /api/owner/dashboard/overview
 * Protected route - requires authentication
 */
router.get('/dashboard/overview', authMiddleware, ownerController.getDashboardOverview);

/**
 * GET /api/owner/shops?page=1&limit=8&keyword=&city=
 * Protected route - requires authentication
 */
router.get('/shops', authMiddleware, ownerController.getShops);

/**
 * POST /api/owner/shops/create
 * Protected route - requires authentication
 * Upload multiple photos (max 10 files)
 */
router.post('/shops/create', authMiddleware, upload.array('photos', 10), ownerController.createCafe);

/**
 * GET /api/owner/shops/:id
 * Get detailed cafe information
 */
router.get('/shops/:id', authMiddleware, ownerController.getCafeDetail);

/**
 * GET /api/owner/shops/:id/stats
 * Get cafe statistics (favorites, reviews, charts data)
 */
router.get('/shops/:id/stats', authMiddleware, ownerController.getCafeStats);

/**
 * GET /api/owner/shops/:id/reviews
 * Get recent reviews for cafe
 */
router.get('/shops/:id/reviews', authMiddleware, ownerController.getCafeReviews);

/**
 * GET /api/owner/shops/:id/promotions
 * Get promotions list for cafe
 */
router.get('/shops/:id/promotions', authMiddleware, ownerController.getCafePromotions);

module.exports = router;
