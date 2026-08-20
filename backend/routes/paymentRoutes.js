import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createTransaction, handleWebhook, checkPaymentStatus } from '../controllers/paymentController.js';
import { getBankInfo } from '../controllers/bankController.js';

const router = express.Router();

// Buat token transaksi Midtrans (QRIS)
router.post('/create-transaction', protect, createTransaction);

// Webhook dari server Midtrans (public, tidak pakai auth)
router.post('/webhook', handleWebhook);

// Cek status pembayaran
router.get('/status/:orderId', protect, checkPaymentStatus);

// Info rekening bank — hanya bisa diakses user yang sudah login
// Nomor rekening tidak pernah ada di frontend/source code
router.get('/bank-info', protect, getBankInfo);

export default router;
