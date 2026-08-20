import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ArrowLeft, Truck, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { Order, OrderStatus, PaymentMethod } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import OrderPaymentInstructions from '../components/payment/OrderPaymentInstructions';

const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg';
  };

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && auth.token) {
      fetchOrder();
    }
  }, [id, auth.token]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case OrderStatus.PROCESSING:
        return <Package className="h-6 w-6 text-blue-500" />;
      case OrderStatus.SHIPPING:
        return <Truck className="h-6 w-6 text-purple-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Clock className="h-6 w-6 text-neutral-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Pesanan Tidak Ditemukan</h2>
        <p className="mb-6">Maaf, kami tidak dapat menemukan pesanan yang Anda cari.</p>
        <Link to="/order-history" className="btn-primary">
          Lihat Riwayat Pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom">
        <Link to="/order-history" className="flex items-center text-neutral-600 hover:text-primary-500 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Riwayat Pesanan
        </Link>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Pesanan #{order._id}</h1>
                  <p className="text-neutral-600">
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
                <div className={`inline-flex items-center px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-2 font-medium">{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Details */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Item Pesanan</h2>
                  <div className="divide-y divide-neutral-200">
                    {order.orderItems.map((item: any) => (
                      <div key={item._id} className="py-4 flex items-center">
                        <div className="w-16 h-16 shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                          <img src={getImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" onError={handleImageError} />
                        </div>
                        <div className="ml-4 grow">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-neutral-500">
                            {item.quantity} x Rp{item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="font-semibold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span>
                        <span>Rp{order.itemsPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600">
                        <span>Ongkos Kirim</span>
                        <span>Rp{order.shippingPrice.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <span className="text-primary-500">Rp{order.totalPrice.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping & Payment Info */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Informasi Pengiriman</h2>
                    <div className="bg-neutral-50 p-4 rounded-md">
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p className="text-neutral-600 mt-1">{order.shippingAddress.phone}</p>
                      <p className="text-neutral-600 mt-1">{order.shippingAddress.address}</p>
                      <p className="text-neutral-600">
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-4">Metode Pembayaran</h2>
                    <div className="bg-neutral-50 p-4 rounded-md">
                      <p className="text-neutral-600">{getPaymentMethodText(order.paymentMethod)}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Catatan Pesanan</h2>
                      <div className="bg-neutral-50 p-4 rounded-md">
                        <p className="text-neutral-600">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {order.status === OrderStatus.PENDING && order.paymentMethod !== PaymentMethod.COD && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Instruksi Pembayaran</h2>
              <OrderPaymentInstructions order={order} onPaymentUpdated={fetchOrder} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
