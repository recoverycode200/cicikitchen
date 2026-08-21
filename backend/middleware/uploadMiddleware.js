import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Konfigurasi Cloudinary dari environment variables (Railway Variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage langsung ke Cloudinary, bukan folder lokal.
// Ini penting karena filesystem Railway bersifat ephemeral —
// file yang disimpan secara lokal akan hilang setiap kali redeploy.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cici-kitchen', // semua foto produk masuk ke folder ini di Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // batasi ukuran max
  },
});

// Initialize upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
