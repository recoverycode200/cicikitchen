import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Seorang user hanya bisa memberi satu ulasan untuk satu produk dari satu pesanan yang sama
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
