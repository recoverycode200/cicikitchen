import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

// Helper: hitung ulang rating rata-rata & jumlah ulasan sebuah produk
const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const product = await Product.findById(productId);
  if (!product) return;

  if (stats.length > 0) {
    product.rating = Math.round(stats[0].avgRating * 10) / 10;
    product.numReviews = stats[0].numReviews;
  } else {
    product.rating = 0;
    product.numReviews = 0;
  }

  await product.save();
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id }).populate('user', 'name').sort({ createdAt: -1 });

  res.json({
    success: true,
    data: reviews,
  });
});

// @desc    Check if logged in user can review a product (and which orders are eligible)
// @route   GET /api/products/:id/reviews/eligibility
// @access  Private
const getReviewEligibility = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  // Cari pesanan milik user, sudah "delivered", dan mengandung produk ini
  const deliveredOrders = await Order.find({
    user: req.user._id,
    status: 'delivered',
    'orderItems.product': productId,
  }).select('_id createdAt');

  // Cari review yang sudah pernah dibuat user untuk produk ini
  const existingReviews = await Review.find({
    product: productId,
    user: req.user._id,
  }).select('order');

  const reviewedOrderIds = existingReviews.map((r) => r.order.toString());

  // Pesanan yang sudah delivered tapi belum diberi ulasan
  const eligibleOrders = deliveredOrders.filter((order) => !reviewedOrderIds.includes(order._id.toString()));

  res.json({
    success: true,
    data: {
      canReview: eligibleOrders.length > 0,
      eligibleOrders,
    },
  });
});

// @desc    Create a new review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, orderId } = req.body;
  const productId = req.params.id;

  if (!rating || !comment || !orderId) {
    res.status(400);
    throw new Error('Rating, komentar, dan ID pesanan wajib diisi');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Produk tidak ditemukan');
  }

  // Pastikan pesanan benar-benar milik user, sudah delivered, dan berisi produk ini
  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    status: 'delivered',
    'orderItems.product': productId,
  });

  if (!order) {
    res.status(403);
    throw new Error('Anda hanya dapat memberi ulasan untuk produk yang sudah Anda beli dan diterima');
  }

  // Cek apakah sudah pernah memberi ulasan untuk pesanan ini
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id,
    order: orderId,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Anda sudah memberi ulasan untuk pesanan ini');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: orderId,
    rating: Number(rating),
    comment,
  });

  await recalculateProductRating(productId);

  const populatedReview = await Review.findById(review._id).populate('user', 'name');

  res.status(201).json({
    success: true,
    data: populatedReview,
  });
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private (owner of review or admin)
const deleteProductReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Ulasan tidak ditemukan');
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Tidak diizinkan menghapus ulasan ini');
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  res.json({
    success: true,
    message: 'Ulasan berhasil dihapus',
  });
});

// @desc    Get all reviews (for homepage testimonials)
// @route   GET /api/reviews
// @access  Public
const getAllReviews = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const reviews = await Review.find({ rating: { $gte: 4 } })
    .populate('user', 'name')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({
    success: true,
    data: reviews,
  });
});

export { getProductReviews, getReviewEligibility, createProductReview, deleteProductReview, getAllReviews };
