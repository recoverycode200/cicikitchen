import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, User as UserIcon, MapPin, CreditCard, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Order, OrderStatus, PaymentMethod, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { auth } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${apiUrl}${imagePath}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg';
  };

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setOrder(res.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Gagal mengambil detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && auth.token) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, auth.token]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      await axios.put(
        `${apiUrl}/api/orders/${order._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success('Status pesanan berhasil diperbarui');
      fetchOrder();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Gagal memperbarui status pesanan');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-5 w-5" />;
      case OrderStatus.PROCESSING:
        return <Package className="h-5 w-5" />;
      case OrderStatus.SHIPPING:
        return <Truck className="h-5 w-5" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-5 w-5" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Menunggu';
      case OrderStatus.PROCESSING:
        return 'Diproses';
      case OrderStatus.SHIPPING:
        return 'Dikirim';
      case OrderStatus.DELIVERED:
        return 'Diterima';
      case OrderStatus.CANCELLED:
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.COD:
        return 'Bayar di Tempat (COD)';
      case PaymentMethod.BANK_MANDIRI:
        return 'Transfer Bank Mandiri';
      case PaymentMethod.QRIS_MANDIRI:
        return 'Pembayaran Online (Midtrans)';
      default:
        return method;
    }
  };

  const getPaymentStatusText = (status?: string) => {
    switch (status) {
      case 'unpaid':
        return 'Belum Dibayar';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'completed':
        return 'Sudah Dibayar';
      case 'failed':
        return 'Gagal';
      case 'expired':
        return 'Kedaluwarsa';
      default:
        return status || '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-4">Pesanan Tidak Ditemukan</h2>
        <Link to="/admin/orders" className="text-primary-500 hover:text-primary-600 font-medium">
          Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const customer = order.user as User;

  return (
    <div>
      <Link to="/admin/orders" className="flex items-center text-neutral-600 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Kembali ke Daftar Pesanan
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pesanan #{order._id.slice(-6)}</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Dipesan pada{' '}
            {new Date(order.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="font-medium text-sm">{getStatusText(order.status)}</span>
          </div>

          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="input-field py-2 text-sm"
          >
            <option value={OrderStatus.PENDING}>Menunggu</option>
            <option value={OrderStatus.PROCESSING}>Diproses</option>
            <option value={OrderStatus.SHIPPING}>Dikirim</option>
            <option value={OrderStatus.DELIVERED}>Diterima</option>
            <option value={OrderStatus.CANCELLED}>Dibatalkan</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom kiri: Item pesanan */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-neutral-500" />
              Item Pesanan
            </h2>
            <div className="divide-y divide-neutral-200">
              {order.orderItems.map((item: any, idx: number) => (
                <div key={item._id || idx} className="py-4 flex items-center">
                  <div className="w-16 h-16 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                    {item.product?.image && (
                      <img
                        src={getImageUrl(item.product.image)}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium">{item.product?.name || 'Produk telah dihapus'}</h3>
                    <p className="text-sm text-neutral-500">
                      {item.quantity} x Rp{item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="font-semibold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>Rp{order.itemsPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Ongkos Kirim</span>
                <span>Rp{order.shippingPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-100">
                <span>Total</span>
                <span className="text-primary-500">Rp{order.totalPrice.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-neutral-500" />
                Catatan Pesanan
              </h2>
              <p className="text-neutral-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Kolom kanan: Info pelanggan, pengiriman, pembayaran */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-neutral-500" />
              Pelanggan
            </h2>
            <p className="font-medium text-neutral-900">{customer?.name || order.shippingAddress.fullName}</p>
            {customer?.email && <p className="text-sm text-neutral-500 mt-1">{customer.email}</p>}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-neutral-500" />
              Informasi Pengiriman
            </h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-neutral-900">{order.shippingAddress.fullName}</p>
              <p className="text-neutral-600">{order.shippingAddress.phone}</p>
              <p className="text-neutral-600">{order.shippingAddress.address}</p>
              <p className="text-neutral-600">
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-neutral-500" />
              Pembayaran
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Metode</span>
                <span className="font-medium text-neutral-900">{getPaymentMethodText(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status Pembayaran</span>
                <span className="font-medium text-neutral-900">{getPaymentStatusText(order.paymentStatus)}</span>
              </div>
              {order.paymentDetails?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">ID Transaksi</span>
                  <span className="font-medium text-neutral-900">{order.paymentDetails.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
