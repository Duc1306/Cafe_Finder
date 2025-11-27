const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');

/**
 * GET /api/owner/dashboard/overview?ownerId=1
 */
router.get('/dashboard/overview', ownerController.getDashboardOverview);

/**
 * GET /api/owner/shops?ownerId=1&page=1&limit=8&keyword=&city=
 */
router.get('/shops', ownerController.getShops);

module.exports = router;
