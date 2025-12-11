const express = require('express');
const router = express.Router();
const nearbyController = require('../controllers/nearbyCafeController');

// GET /api/nearby
router.get('/', nearbyController.getNearby);

module.exports = router;