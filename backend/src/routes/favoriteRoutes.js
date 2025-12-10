/**
 * Favorite Routes
 * API endpoints for user favorites
 */
const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.get('/', authMiddleware, favoriteController.getUserFavorites);
router.post('/', authMiddleware, favoriteController.addFavorite);
router.delete('/:cafeId', authMiddleware, favoriteController.removeFavorite);

module.exports = router;
