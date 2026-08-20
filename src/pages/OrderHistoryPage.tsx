import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  const getImageUrl = (imagePath: string) => {
    // Jika sudah URL lengkap (http/https), gunakan langsung
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Jika path lokal, tambahkan base URL
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg';
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setOrders(response.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchOrders();
    }
  }, [auth.token]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Riwayat Pesanan</h1>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-primary-500" />
                        <h2 className="font-semibold">Pesanan #{order._id}</h2>
                      </div>
                      <p className="text-sm text-neutral-600">
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
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                      <span className="font-semibold text-primary-500">Rp{order.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 overflow-x-auto py-2">
                    {order.orderItems.map((item: any) => (
                      <div key={item._id} className="shrink-0">
                        <div className="w-16 h-16 bg-neutral-100 rounded-md overflow-hidden">
                          <img src={getImageUrl(item.product.image)} alt={item.product.name} className="w-full h-full object-cover" onError={handleImageError} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingBag className="h-12 w-12" />}
            title="Belum ada pesanan"
            description="Anda belum melakukan pemesanan apapun. Mulai berbelanja untuk melihat riwayat pesanan Anda di sini."
            actionText="Lihat Produk"
            actionLink="/products"
          />
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
