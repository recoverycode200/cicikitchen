import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Copy, CheckCheck, MessageCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { PaymentMethod } from '../types';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import MidtransPaymentModal from '../components/payment/MidtransPaymentModal';
import axios from 'axios';
import { toast } from 'react-toastify';

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  whatsapp: string;
}

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const [notes, setNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [orderTotalPrice, setOrderTotalPrice] = useState<number>(0);

  // Nomor rekening diambil dari backend — tidak hardcode di sini
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [bankInfoLoading, setBankInfoLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch info rekening saat user pilih Transfer Bank
  useEffect(() => {
    if (paymentMethod === PaymentMethod.BANK_MANDIRI && !bankInfo) {
      setBankInfoLoading(true);
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/payments/bank-info`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        })
        .then((res) => setBankInfo(res.data.data))
        .catch(() => toast.error('Gagal memuat info rekening. Pastikan sudah login.'))
        .finally(() => setBankInfoLoading(false));
    }
  }, [paymentMethod]);

  const handleCopyAccountNumber = () => {
    if (!bankInfo) return;
    navigator.clipboard.writeText(bankInfo.accountNumber.replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Nomor rekening disalin!');
  };

  const getShippingCost = (method: PaymentMethod): number => {
    switch (method) {
      case PaymentMethod.COD:
        return 5000;
      case PaymentMethod.BANK_MANDIRI:
      case PaymentMethod.QRIS_MANDIRI:
        return 0;
      default:
        return 5000;
    }
  };

  const shippingCost = getShippingCost(paymentMethod);
  const totalPrice = cart.totalPrice + shippingCost;

  const getImageUrl = (imagePath: string) => {
    if (imagePath?.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        orderItems: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice: cart.totalPrice,
        shippingPrice: shippingCost,
        totalPrice,
        notes,
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const orderId = response.data.data._id;
      setOrderSubmitted(true);
      setOrderTotalPrice(totalPrice); // simpan total SEBELUM cart dikosongkan
      clearCart();
      toast.success('Pesanan berhasil dibuat!');

      if (paymentMethod === PaymentMethod.QRIS_MANDIRI) {
        setCreatedOrderId(orderId);
        setShowPaymentModal(true);
      } else {
        navigate(`/orders/${orderId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Pembayaran berhasil! Pesanan sedang diproses.');
    if (createdOrderId) navigate(`/orders/${createdOrderId}`);
  };

  const handlePaymentFailed = () => {
    toast.error('Pembayaran gagal. Anda masih bisa coba lagi dari halaman pesanan.');
    if (createdOrderId) navigate(`/orders/${createdOrderId}`);
  };

  useEffect(() => {
    if (cart.items.length === 0 && !orderSubmitted) {
      navigate('/cart');
    }
  }, [cart.items.length]);

  return (
    <div className="py-6 md:py-10">
      {/* Modal Midtrans Snap */}
      {createdOrderId && (
        <MidtransPaymentModal
          orderId={createdOrderId}
          totalPrice={orderTotalPrice}
          firstName={shippingAddress.fullName.split(' ')[0]}
          lastName={shippingAddress.fullName.split(' ').slice(1).join(' ') || 'Customer'}
          email={auth.user?.email || ''}
          phone={shippingAddress.phone}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Form */}
          <div className="order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Pengiriman */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <Truck className="h-5 w-5 text-primary-500 mr-2" />
                  <h2 className="text-lg md:text-xl font-semibold">Informasi Pengiriman</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input type="text" id="fullName" name="fullName" required value={shippingAddress.fullName} onChange={handleInputChange} className="input-field" placeholder="Masukkan nama lengkap" />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input type="tel" id="phone" name="phone" required value={shippingAddress.phone} onChange={handleInputChange} className="input-field" placeholder="08xxxxxxxxxx" />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1">
                      Alamat Lengkap
                    </label>
                    <input type="text" id="address" name="address" required value={shippingAddress.address} onChange={handleInputChange} className="input-field" placeholder="Nama jalan, nomor rumah, RT/RW" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1">
                        Kota
                      </label>
                      <input type="text" id="city" name="city" required value={shippingAddress.city} onChange={handleInputChange} className="input-field" placeholder="Kota" />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700 mb-1">
                        Kode Pos
                      </label>
                      <input type="text" id="postalCode" name="postalCode" required value={shippingAddress.postalCode} onChange={handleInputChange} className="input-field" placeholder="Kode pos" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Metode Pembayaran</h2>
                <PaymentMethodSelector selectedMethod={paymentMethod} onMethodChange={setPaymentMethod} />

                {/* Info ongkir */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                  <strong>Ongkos Kirim:</strong>
                  <ul className="mt-1 space-y-0.5">
                    <li>• COD: Rp5.000</li>
                    <li>• Transfer Bank & Bayar Online: Gratis</li>
                  </ul>
                </div>

                {/* Info rekening dari backend — tidak ada nomor rekening hardcode di sini */}
                {paymentMethod === PaymentMethod.BANK_MANDIRI && (
                  <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-3">Info Transfer:</p>

                    {bankInfoLoading && (
                      <div className="flex items-center gap-2 text-yellow-700 text-sm">
                        <div className="animate-spin h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full" />
                        Memuat info rekening...
                      </div>
                    )}

                    {!bankInfoLoading && bankInfo && (
                      <div className="space-y-3">
                        {/* Kotak nomor rekening dengan tombol salin */}
                        <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-yellow-200">
                          <div>
                            <p className="text-xs text-neutral-500">{bankInfo.bankName}</p>
                            <p className="font-bold text-neutral-900 tracking-widest text-lg">{bankInfo.accountNumber}</p>
                            <p className="text-xs text-neutral-600">a.n. {bankInfo.accountName}</p>
                          </div>
                          <button type="button" onClick={handleCopyAccountNumber} className="ml-3 p-2 rounded-md hover:bg-yellow-100 text-yellow-700 transition-colors" title="Salin nomor rekening">
                            {copied ? <CheckCheck className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>

                        <p className="text-xs text-yellow-700">Setelah transfer, konfirmasi via WhatsApp dengan bukti pembayaran.</p>

                        {/* Tombol WhatsApp konfirmasi */}
                        {bankInfo.whatsapp && (
                          <a
                            href={`https://wa.me/${bankInfo.whatsapp}?text=Halo, saya sudah transfer untuk pesanan Cici Kitchen`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Konfirmasi via WhatsApp
                          </a>
                        )}
                      </div>
                    )}

                    {!bankInfoLoading && !bankInfo && <p className="text-sm text-red-600">Gagal memuat info rekening. Refresh halaman atau hubungi kami.</p>}
                  </div>
                )}
              </div>

              {/* Catatan */}
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <ShoppingBag className="h-5 w-5 text-primary-500 mr-2" />
                  <h2 className="text-lg md:text-xl font-semibold">Catatan Pesanan</h2>
                </div>
                <textarea id="notes" name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" placeholder="Catatan khusus untuk pesanan (opsional)" />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Memproses...
                  </div>
                ) : paymentMethod === PaymentMethod.QRIS_MANDIRI ? (
                  'Lanjut ke Pembayaran'
                ) : (
                  'Buat Pesanan'
                )}
              </button>
            </form>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="order-1 lg:order-2">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Ringkasan Pesanan</h2>

              {/* Mobile: compact */}
              <div className="md:hidden mb-4">
                <div className="text-sm text-neutral-600 mb-2">{cart.items.length} item</div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.product._id} className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 shrink-0 bg-neutral-100 rounded overflow-hidden">
                        <img src={getImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" onError={handleImageError} />
                      </div>
                      <div className="grow min-w-0">
                        <div className="font-medium truncate">{item.product.name}</div>
                        <div className="text-neutral-500">{item.quantity}x</div>
                      </div>
                      <div className="font-semibold text-primary-500">Rp{(item.product.price * item.quantity).toLocaleString('id-ID')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: full list */}
              <div className="hidden md:block divide-y divide-neutral-200 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="py-4 flex items-center">
                    <div className="w-16 h-16 shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                      <img src={getImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" onError={handleImageError} />
                    </div>
                    <div className="ml-4 grow">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-neutral-500">
                        {item.quantity} × Rp{item.product.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="font-semibold">Rp{(item.product.price * item.quantity).toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">Rp{cart.totalPrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-neutral-600">Ongkos Kirim</span>
                  <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>{shippingCost === 0 ? 'Gratis' : `Rp${shippingCost.toLocaleString('id-ID')}`}</span>
                </div>
                {shippingCost === 0 && <p className="text-xs text-green-600 italic">Gratis ongkir untuk metode ini!</p>}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-base md:text-lg">
                    <span>Total</span>
                    <span className="text-primary-500">Rp{totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
