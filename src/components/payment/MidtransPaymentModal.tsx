import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Loader, X, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface MidtransPaymentModalProps {
  orderId: string;
  totalPrice: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onPaymentSuccess: () => void;
  onPaymentFailed?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentState = 'idle' | 'loading' | 'redirect' | 'success' | 'failed' | 'pending';

const MidtransPaymentModal: React.FC<MidtransPaymentModalProps> = ({ orderId, totalPrice, firstName, lastName, email, phone, onPaymentSuccess, onPaymentFailed, isOpen, onClose }) => {
  const [state, setState] = useState<PaymentState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isOpen && state === 'idle' && !hasStarted.current) {
      hasStarted.current = true;
      handlePayment();
    }
    if (!isOpen) {
      hasStarted.current = false;
      setState('idle');
      setError(null);
      setRedirectUrl(null);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setState('loading');
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await axios.post(
        `${apiUrl}/api/payments/create-transaction`,
        { orderId, totalPrice, firstName, lastName, email, phone },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success && response.data.redirectUrl) {
        setRedirectUrl(response.data.redirectUrl);
        setState('redirect');
      } else {
        throw new Error('URL pembayaran tidak valid');
      }
    } catch (err: any) {
      console.error('[Midtrans] Error:', err);
      setState('failed');
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat transaksi. Silakan coba lagi.');
      onPaymentFailed?.();
    }
  };

  const handleOpenPayment = () => {
    if (redirectUrl) {
      window.open(redirectUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-bold text-neutral-900">Pembayaran Online</h2>
          {(state === 'idle' || state === 'failed' || state === 'redirect') && (
            <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Loading */}
          {state === 'loading' && (
            <div className="text-center py-8">
              <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="font-semibold text-neutral-900">Menyiapkan pembayaran...</p>
              <p className="text-sm text-neutral-500 mt-1">Mohon tunggu sebentar</p>
            </div>
          )}

          {/* Redirect — tampilkan tombol buka halaman pembayaran */}
          {state === 'redirect' && redirectUrl && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Total Pembayaran</p>
                <p className="text-2xl font-bold text-neutral-900">Rp{totalPrice.toLocaleString('id-ID')}</p>
                <p className="text-xs text-neutral-400 mt-1">Order #{orderId.slice(-8).toUpperCase()}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Transaksi berhasil dibuat! Klik tombol di bawah untuk membuka halaman pembayaran Midtrans dan pilih metode yang kamu mau (QRIS, GoPay, transfer VA, kartu kredit, dll).</p>
              </div>

              <button onClick={handleOpenPayment} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Buka Halaman Pembayaran
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700 text-center">Setelah selesai membayar, kembali ke halaman ini dan klik tombol di bawah.</p>
              </div>

              <button
                onClick={() => {
                  onPaymentSuccess();
                  onClose();
                }}
                className="w-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
              >
                Saya Sudah Membayar
              </button>

              <button onClick={onClose} className="w-full text-neutral-400 hover:text-neutral-600 text-sm py-1 transition-colors">
                Bayar Nanti
              </button>
            </div>
          )}

          {/* Failed */}
          {state === 'failed' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-xs text-neutral-500 mb-1">Total Pembayaran</p>
                <p className="text-2xl font-bold text-neutral-900">Rp{totalPrice.toLocaleString('id-ID')}</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button onClick={handlePayment} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                Coba Lagi
              </button>

              <button onClick={onClose} className="w-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold py-2.5 px-4 rounded-xl transition-colors">
                Batal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MidtransPaymentModal;
