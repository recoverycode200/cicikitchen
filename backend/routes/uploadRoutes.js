import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload a file to Cloudinary
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // multer-storage-cloudinary mengembalikan URL lengkap di req.file.path
  const imagePath = req.file.path;

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
