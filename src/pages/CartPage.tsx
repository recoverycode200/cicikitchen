import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/cart/CartItem';
import EmptyState from '../components/ui/EmptyState';

const CartPage: React.FC = () => {
  const { cart, clearCart } = useCart();

  // Default shipping cost (will be updated in checkout based on payment method)
  const defaultShippingCost = 5000;

  return (
    <div className="py-6 md:py-10">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Keranjang Belanja</h1>

        {cart.items.length > 0 ? (
          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header - Desktop */}
                <div className="hidden md:flex justify-between items-center p-4 md:p-6 border-b border-neutral-200">
                  <h2 className="text-lg md:text-xl font-semibold">Produk dalam Keranjang ({cart.totalItems})</h2>
                  <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                    Kosongkan Keranjang
                  </button>
                </div>

                {/* Header - Mobile */}
                <div className="md:hidden p-4 border-b border-neutral-200">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Keranjang ({cart.totalItems})</h2>
                    <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium">
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-neutral-200">
                  {cart.items.map((item) => (
                    <CartItem key={item.product._id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:sticky lg:top-24">
                <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Ringkasan Pesanan</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-medium">Rp{cart.totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-neutral-600">Ongkos Kirim</span>
                    <span className="font-medium">Rp{defaultShippingCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-xs text-neutral-500 italic">* Ongkos kirim final akan disesuaikan dengan metode pembayaran</div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-base md:text-lg">
                      <span>Total</span>
                      <span className="text-primary-500">Rp{(cart.totalPrice + defaultShippingCost).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <Link to="/checkout" className="btn-primary w-full flex items-center justify-center py-3 mb-4">
                  Lanjut ke Pembayaran
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>

                <div className="text-center">
                  <Link to="/products" className="text-primary-500 hover:text-primary-600 font-medium text-sm md:text-base transition-colors">
                    Lanjut Belanja
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={<ShoppingCart className="h-12 w-12 md:h-16 md:w-16" />} title="Keranjang Anda kosong" description="Anda belum menambahkan produk apapun ke keranjang." actionText="Lihat Produk" actionLink="/products" />
        )}
      </div>
    </div>
  );
};

export default CartPage;
