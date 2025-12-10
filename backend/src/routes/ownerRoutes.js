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

module.exports = router;
