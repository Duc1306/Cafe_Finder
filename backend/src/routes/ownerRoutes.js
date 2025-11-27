const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middlewares/authMiddleware');

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

module.exports = router;
