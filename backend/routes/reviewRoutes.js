import express from 'express';
import { getAllReviews } from '../controllers/reviewController.js';

const router = express.Router();

// @route   GET /api/reviews
router.get('/', getAllReviews);

export default router;
