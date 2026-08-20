import React, { useEffect, useState } from 'react';
import { Truck, CreditCard, Smartphone, CheckCircle, Loader, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { Order, PaymentMethod, PaymentStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import MidtransPaymentModal from './MidtransPaymentModal';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  whatsapp: string;
}

interface OrderPaymentInstructionsProps {
  order: Order;
  onPaymentUpdated: () => void;
}

// Komponen ini murni MENAMPILKAN instruksi untuk metode pembayaran yang
// SUDAH dipilih customer saat checkout (read-only) — bukan selector untuk
// mengubah metode. Khusus QRIS, ada tombol retry yang membuka modal
// Midtrans yang sesungguhnya, supaya pesan "coba lagi dari halaman pesanan"
// benar-benar berfungsi.
const OrderPaymentInstructions: React.FC<OrderPaymentInstructionsProps> = ({ order, onPaymentUpdated }) => {
  const { auth } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [bankInfoLoading, setBankInfoLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPaid = order.paymentStatus === PaymentStatus.COMPLETED;

  useEffect(() => {
    if (order.paymentMethod === PaymentMethod.BANK_MANDIRI && !isPaid) {
      const fetchBankInfo = async () => {
        setBankInfoLoading(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/payments/bank-info`, {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          setBankInfo(response.data.data);
        } catch (error) {
          console.error('Gagal mengambil info bank:', error);
        } finally {
          setBankInfoLoading(false);
        }
      };
      fetchBankInfo();
    }
  }, [order.paymentMethod, isPaid, auth.token]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nameParts = order.shippingAddress.fullName.trim().split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || 'Customer';

  if (isPaid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
        <p className="text-green-700 font-medium">Pembayaran untuk pesanan ini sudah diterima. Terima kasih!</p>
      </div>
    );
  }

  if (order.paymentMethod === PaymentMethod.COD) {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex items-center gap-3">
        <Truck className="h-6 w-6 text-primary-500 shrink-0" />
        <p className="text-neutral-700">
          Bayar tunai sebesar <strong>Rp{order.totalPrice.toLocaleString('id-ID')}</strong> saat barang diterima.
        </p>
      </div>
    );
  }

  if (order.paymentMethod === PaymentMethod.BANK_MANDIRI) {
    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-neutral-900 font-medium">
          <CreditCard className="h-5 w-5 text-primary-500" />
          Transfer ke rekening berikut
        </div>
        {bankInfoLoading && (
          <div className="flex items-center gap-2 text-neutral-500 text-sm py-2">
            <Loader className="h-4 w-4 animate-spin" /> Memuat info rekening...
          </div>
        )}
        {bankInfo && (
          <div className="bg-neutral-50 rounded-md p-4 space-y-1">
            <p className="text-sm text-neutral-500">{bankInfo.bankName}</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-neutral-900">{bankInfo.accountNumber}</p>
              <button onClick={() => handleCopy(bankInfo.accountNumber)} className="text-neutral-400 hover:text-primary-500" title="Salin nomor rekening">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-neutral-600">a.n. {bankInfo.accountName}</p>
          </div>
        )}
        <p className="text-sm text-neutral-600">
          Transfer sebesar <strong>Rp{order.totalPrice.toLocaleString('id-ID')}</strong>, lalu konfirmasi ke WhatsApp{bankInfo?.whatsapp ? ` ${bankInfo.whatsapp}` : ''} dengan menyertakan nomor pesanan.
        </p>
      </div>
    );
  }

  if (order.paymentMethod === PaymentMethod.QRIS_MANDIRI) {
    return (
      <>
        <div className="bg-white border border-neutral-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-neutral-900 font-medium">
            <Smartphone className="h-5 w-5 text-primary-500" />
            Pembayaran online belum selesai
          </div>
          <p className="text-sm text-neutral-600">
            Klik tombol di bawah untuk membuka kembali halaman pembayaran Midtrans dan menyelesaikan pembayaran sebesar <strong>Rp{order.totalPrice.toLocaleString('id-ID')}</strong>.
          </p>
          <button onClick={() => setShowPaymentModal(true)} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl transition-colors">
            Bayar Sekarang
          </button>
        </div>

        <MidtransPaymentModal
          orderId={order._id}
          totalPrice={order.totalPrice}
          firstName={firstName}
          lastName={lastName}
          email={typeof order.user === 'object' ? order.user.email : auth.user?.email || ''}
          phone={order.shippingAddress.phone}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            onPaymentUpdated();
          }}
        />
      </>
    );
  }

  return null;
};

export default OrderPaymentInstructions;
