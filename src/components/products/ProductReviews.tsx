import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Review, ReviewEligibility } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from './StarRating';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { auth } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/products/${productId}/reviews`);
      setReviews(res.data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibility = async () => {
    if (!auth.token) return;
    try {
      const res = await axios.get(`${apiUrl}/api/products/${productId}/reviews/eligibility`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setEligibility(res.data.data);
      if (res.data.data.eligibleOrders.length > 0) {
        setSelectedOrderId(res.data.data.eligibleOrders[0]._id);
      }
    } catch (error) {
      console.error('Error fetching review eligibility:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, auth.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Silakan pilih rating bintang');
      return;
    }
    if (!comment.trim()) {
      toast.error('Silakan tulis ulasan Anda');
      return;
    }
    if (!selectedOrderId) {
      toast.error('Pesanan tidak valid');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${apiUrl}/api/products/${productId}/reviews`,
        { rating, comment, orderId: selectedOrderId },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success('Terima kasih atas ulasan Anda!');
      setRating(0);
      setComment('');
      fetchReviews();
      fetchEligibility();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengirim ulasan';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Ulasan Pelanggan {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {/* Form Ulasan - hanya tampil jika user login dan eligible */}
      {auth.token && eligibility?.canReview && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="font-semibold mb-4">Bagikan Pendapat Anda</h3>
          <form onSubmit={handleSubmit}>
            {eligibility.eligibleOrders.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Untuk Pesanan</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="input-field"
                >
                  {eligibility.eligibleOrders.map((order) => (
                    <option key={order._id} value={order._id}>
                      #{order._id.slice(-6)} -{' '}
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Rating Anda</label>
              <StarRating rating={rating} size={28} interactive onChange={setRating} />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Ulasan Anda</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Bagaimana pengalaman Anda dengan produk ini?"
                className="input-field resize-none"
              />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Send className="h-4 w-4" />
              {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </form>
        </div>
      )}

      {auth.token && eligibility && !eligibility.canReview && (
        <div className="bg-neutral-50 rounded-lg p-4 mb-8 text-sm text-neutral-600">
          Anda dapat memberi ulasan setelah pesanan produk ini berstatus "Diterima" dan belum pernah diulas
          sebelumnya.
        </div>
      )}

      {!auth.token && (
        <div className="bg-neutral-50 rounded-lg p-4 mb-8 text-sm text-neutral-600">
          Silakan masuk untuk memberi ulasan setelah pesanan Anda diterima.
        </div>
      )}

      {/* Daftar Ulasan */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-neutral-900">{(review.user as any)?.name || 'Pengguna'}</p>
                  <StarRating rating={review.rating} size={14} />
                </div>
                <span className="text-xs text-neutral-400">
                  {new Date(review.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-neutral-600 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutral-500 text-center py-8">Belum ada ulasan untuk produk ini.</p>
      )}
    </div>
  );
};

export default ProductReviews;
