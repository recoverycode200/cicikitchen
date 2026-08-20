import React from 'react';
import { Link } from 'react-router-dom';
import { Trash, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart } = useCart();

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

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(product._id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(product._id);
  };

  return (
    <div className="p-4 md:py-4 md:px-6 animate-fade-in">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex gap-3">
          {/* Product Image */}
          <div className="w-16 h-16 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
            <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" onError={handleImageError} />
          </div>

          {/* Product Info */}
          <div className="flex-grow min-w-0">
            <Link to={`/products/${product._id}`} className="font-medium text-neutral-800 hover:text-primary-500 transition-colors text-sm line-clamp-2 leading-tight">
              {product.name}
            </Link>
            <p className="text-xs text-neutral-500 mt-1">Rp{product.price.toLocaleString('id-ID')} per item</p>

            {/* Quantity Controls - Mobile */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center border border-neutral-300 rounded-md">
                <button onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1} className={`p-1.5 ${quantity <= 1 ? 'text-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'} transition-colors`}>
                  <Minus className="h-3 w-3" />
                </button>

                <span className="px-3 py-1.5 text-sm font-medium min-w-[40px] text-center">{quantity}</span>

                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.inStock}
                  className={`p-1.5 ${quantity >= product.inStock ? 'text-neutral-300' : 'text-neutral-600 hover:bg-neutral-100'} transition-colors`}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Price and Remove - Mobile */}
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-primary-500">Rp{(product.price * quantity).toLocaleString('id-ID')}</div>
                <button onClick={handleRemove} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center">
        <div className="w-20 h-20 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
          <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" onError={handleImageError} />
        </div>

        <div className="ml-4 flex-grow">
          <Link to={`/products/${product._id}`} className="font-medium text-neutral-800 hover:text-primary-500 transition-colors">
            {product.name}
          </Link>
          <p className="text-sm text-neutral-500 mt-1">Rp{product.price.toLocaleString('id-ID')} per item</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className={`p-2 rounded border ${quantity <= 1 ? 'text-neutral-300 border-neutral-200' : 'text-neutral-500 hover:bg-neutral-100 border-neutral-300'} transition-colors`}
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="w-12 text-center font-medium">{quantity}</span>

          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.inStock}
            className={`p-2 rounded border ${quantity >= product.inStock ? 'text-neutral-300 border-neutral-200' : 'text-neutral-500 hover:bg-neutral-100 border-neutral-300'} transition-colors`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-6 font-semibold text-lg">Rp{(product.price * quantity).toLocaleString('id-ID')}</div>

        <button onClick={handleRemove} className="ml-4 p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 rounded-full transition-colors">
          <Trash className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
