import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { PaymentStatus } from '../../types';

interface PaymentStatusProps {
  orderId: string;
  onStatusUpdate?: (status: PaymentStatus) => void;
}

const PaymentStatusComponent: React.FC<PaymentStatusProps> = ({ orderId, onStatusUpdate }) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.get(`http://localhost:5000/api/payments/status/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('[v0] Payment status response:', response.data);

        if (response.data.success) {
          const status = response.data.paymentStatus as PaymentStatus;
          setPaymentStatus(status);

          if (onStatusUpdate) {
            onStatusUpdate(status);
          }

          // Auto-retry if still pending
          if (status === PaymentStatus.PENDING && retryCount < 5) {
            setTimeout(() => {
              setRetryCount((prev) => prev + 1);
            }, 3000);
          }
        }
      } catch (err: any) {
        console.error('[v0] Error checking payment status:', err);
        setError(err.response?.data?.message || 'Gagal mengecek status pembayaran');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId, retryCount]);

  if (loading && !paymentStatus) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Loader className="h-5 w-5 text-blue-600 animate-spin" />
        <div>
          <p className="font-semibold text-blue-900">Memeriksa Status Pembayaran</p>
          <p className="text-sm text-blue-700">Mohon tunggu...</p>
        </div>
      </div>
    );
  }

  if (error && !paymentStatus) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <div>
          <p className="font-semibold text-red-900">Error</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  switch (paymentStatus) {
    case PaymentStatus.COMPLETED:
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-900">Pembayaran Berhasil</p>
            <p className="text-sm text-green-700">Pesanan Anda sedang diproses</p>
          </div>
        </div>
      );

    case PaymentStatus.PENDING:
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
          <div>
            <p className="font-semibold text-yellow-900">Pembayaran Tertunda</p>
            <p className="text-sm text-yellow-700">Menunggu konfirmasi pembayaran dari bank...</p>
          </div>
        </div>
      );

    case PaymentStatus.FAILED:
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Pembayaran Gagal</p>
            <p className="text-sm text-red-700">Silakan ulangi pembayaran atau gunakan metode lain</p>
          </div>
        </div>
      );

    case PaymentStatus.EXPIRED:
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Pembayaran Kadaluarsa</p>
            <p className="text-sm text-red-700">Waktu pembayaran telah habis. Silakan buat pesanan baru</p>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700">Status pembayaran tidak diketahui</p>
        </div>
      );
  }
};

export default PaymentStatusComponent;
