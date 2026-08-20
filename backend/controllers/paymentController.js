import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import midtransClient from 'midtrans-client';

// Noted
// jangan buat instance Snap di top-level module.
let _snap = null;
const getSnap = () => {
  if (!_snap) {
    _snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  }
  return _snap;
};

const formatPhone = (phone = '') => {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) return '62' + clean.slice(1);
  if (clean.startsWith('62')) return clean;
  return clean;
};

// @desc    Buat token transaksi Midtrans (QRIS saja)
// @route   POST /api/payments/create-transaction
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const { orderId, totalPrice, firstName, lastName, email, phone } = req.body;

  if (!orderId || !totalPrice) {
    res.status(400);
    throw new Error('orderId dan totalPrice wajib diisi');
  }

  const order = await Order.findById(orderId).populate('orderItems.product', 'name');
  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }

  if (order.paymentStatus === 'completed') {
    res.status(400);
    throw new Error('Pembayaran untuk order ini sudah selesai');
  }

  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Tidak diizinkan mengakses order ini');
  }

  try {
    const itemDetails = order.orderItems.map((item) => ({
      id: item.product._id?.toString() || item.product.toString(),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: (item.product.name || 'Produk').substring(0, 50),
    }));

    if (order.shippingPrice > 0) {
      itemDetails.push({
        id: 'SHIPPING',
        price: Math.round(order.shippingPrice),
        quantity: 1,
        name: 'Ongkos Kirim',
      });
    }

    const grossAmount = Math.round(totalPrice);
    const itemTotal = itemDetails.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (itemTotal !== grossAmount) {
      itemDetails.push({
        id: 'ADJUSTMENT',
        price: grossAmount - itemTotal,
        quantity: 1,
        name: grossAmount - itemTotal > 0 ? 'Biaya Tambahan' : 'Diskon',
      });
    }

    const midtransOrderId = `${order._id.toString()}-${Date.now()}`;

    const parameter = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: firstName || 'Customer',
        last_name: lastName || '',
        email: email || '',
        phone: formatPhone(phone),
      },
      // enabled_payments sengaja tidak diisi supaya Midtrans Snap menampilkan SEMUA metode
      // pembayaran yang sudah diaktifkan di dashboard Midtrans (QRIS/GoPay, transfer bank VA,
      // kartu kredit, dll). Semua transaksi tetap masuk ke rekening/akun yang sudah didaftarkan
      // di dashboard Midtrans, apapun metode yang dipilih pelanggan.
    };

    const transaction = await getSnap().createTransaction(parameter);

    order.midtransTransactionId = midtransOrderId;
    order.paymentStatus = 'pending';
    await order.save();

    res.status(200).json({
      success: true,
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId: order._id,
    });
  } catch (error) {
    console.error('[Midtrans] createTransaction error:', error.ApiResponse || error.message);
    res.status(500);
    throw new Error(error.ApiResponse?.status_message || `Gagal membuat transaksi: ${error.message}`);
  }
});

// @desc    Handle Midtrans webhook
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = asyncHandler(async (req, res) => {
  const notification = req.body;
  console.log('[Webhook] Notifikasi:', notification.order_id, notification.transaction_status);

  try {
    const statusResponse = await getSnap().transaction.notification(notification);
    const {
      order_id: midtransOrderId,
      transaction_id: transactionId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      payment_type: paymentType,
      gross_amount: grossAmount,
      transaction_time: transactionTime,
    } = statusResponse;

    // Ambil base orderId (hapus suffix timestamp)
    const baseOrderId = midtransOrderId.replace(/-\d+$/, '');
    const order = await Order.findById(baseOrderId);

    if (!order) {
      console.warn('[Webhook] Order tidak ditemukan:', baseOrderId);
      return res.status(200).json({ success: false, message: 'Order tidak ditemukan' });
    }

    order.paymentDetails = {
      transactionId,
      orderId: midtransOrderId,
      grossAmount: parseFloat(grossAmount),
      paymentType,
      transactionTime: transactionTime ? new Date(transactionTime) : new Date(),
      transactionStatus,
      fraudStatus,
    };

    switch (transactionStatus) {
      case 'capture':
        order.paymentStatus = fraudStatus === 'accept' ? 'completed' : 'pending';
        if (fraudStatus === 'accept') order.status = 'processing';
        break;
      case 'settlement':
        order.paymentStatus = 'completed';
        order.status = 'processing';
        break;
      case 'pending':
        order.paymentStatus = 'pending';
        break;
      case 'cancel':
      case 'deny':
      case 'expire':
        order.paymentStatus = transactionStatus === 'expire' ? 'expired' : 'failed';
        order.status = 'cancelled';
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.inStock += item.quantity;
            await product.save();
          }
        }
        break;
    }

    await order.save();
    console.log(`[Webhook] Order ${baseOrderId} → ${order.paymentStatus} / ${order.status}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error:', error.message);
    res.status(200).json({ success: false, error: error.message });
  }
});

// @desc    Cek status pembayaran
// @route   GET /api/payments/status/:orderId
// @access  Private
const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order tidak ditemukan');
  }
  if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Tidak diizinkan');
  }

  let transactionStatusFromMidtrans = null;
  if (order.midtransTransactionId) {
    try {
      const status = await getSnap().transaction.status(order.midtransTransactionId);
      transactionStatusFromMidtrans = status.transaction_status;
      if (status.transaction_status === 'settlement' && order.paymentStatus !== 'completed') {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        await order.save();
      }
    } catch (err) {
      console.warn('[checkPaymentStatus] Gagal sync Midtrans:', err.message);
    }
  }

  res.json({
    success: true,
    paymentStatus: order.paymentStatus,
    orderStatus: order.status,
    transactionStatusFromMidtrans,
    order: { id: order._id, totalPrice: order.totalPrice, paymentStatus: order.paymentStatus },
  });
});

export { createTransaction, handleWebhook, checkPaymentStatus };
