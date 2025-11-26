// src/routes/userRoutes.js
const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
} = require('../controllers/userController');

const router = express.Router();

// Define routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

module.exports = router;
