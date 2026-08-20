import express from 'express';
import { getUserProfile, updateUserProfile, getUsers } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/users
router.get('/', protect, admin, getUsers);

// @route   GET /api/users/profile
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
router.put('/profile', protect, updateUserProfile);

export default router;