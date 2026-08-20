import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Flame } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import StarRating from './StarRating';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

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

  return (
    <Link to={`/products/${product._id}`} className="product-card group block">
      <div className="relative overflow-hidden aspect-square rounded-t-lg">
        <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={handleImageError} loading="lazy" />
        {product.inStock < 1 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-semibold text-xs md:text-sm">Stok Habis</span>
          </div>
        )}
        {product.isFeatured && <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">Unggulan</div>}
        {product.isBestSeller && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Flame className="h-3 w-3" /> Best Seller
          </div>
        )}
      </div>
      <div className="p-3 md:p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-sm md:text-lg line-clamp-2 group-hover:text-primary-500 transition-colors leading-tight">{product.name}</h3>
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={product.rating} size={12} />
              <span className="text-xs text-neutral-500">({product.numReviews})</span>
            </div>
          )}
          <div className="mt-1 md:mt-2">
            <span className="font-bold text-primary-500 text-sm md:text-base">Rp{product.price.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <p className="text-xs md:text-sm text-neutral-600 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">{product.inStock > 0 ? `${product.inStock} tersedia` : 'Stok habis'}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.inStock < 1}
            className={`p-2 rounded-full transition-colors ${product.inStock > 0 ? 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white' : 'bg-neutral-300 cursor-not-allowed text-neutral-500'}`}
          >
            <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
