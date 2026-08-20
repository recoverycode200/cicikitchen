import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import upload from '../middleware/uploadMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// ES Module file path conversion
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload a file
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Return the correct path for frontend access
  const imagePath = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    data: {
      path: imagePath,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    },
    message: 'File uploaded successfully',
  });
});

export default router;
