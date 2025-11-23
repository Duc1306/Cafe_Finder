import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser
} from '../controllers/userController.js';

const router = express.Router();

// Define routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;
