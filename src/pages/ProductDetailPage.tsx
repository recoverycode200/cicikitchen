import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, Flame } from 'lucide-react';
import axios from 'axios';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/products/StarRating';
import ProductReviews from '../components/products/ProductReviews';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/api/products/${id}`);
        setProduct(response.data.data);

        // After getting the product, fetch related products
        if (response.data.data.category) {
          fetchRelatedProducts(response.data.data.category, id);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, apiUrl]);

  const fetchRelatedProducts = async (category: string, currentProductId: string) => {
    try {
      const response = await axios.get(`${apiUrl}/api/products?category=${category}&limit=4`);
      // Filter out the current product
      const filtered = response.data.data.filter((p: Product) => p._id !== currentProductId);
      setRelatedProducts(filtered.slice(0, 4)); // Limit to 4 products
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    }
  };

  const getImageUrl = (imagePath: string) => {
    // Jika sudah URL lengkap (http/https), gunakan langsung
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Jika path lokal, tambahkan base URL
    return `${import.meta.env.VITE_API_URL}${imagePath}`;
  };

  const handleQuantityChange = (value: number) => {
    if (!product) return;

    if (value < 1) {
      setQuantity(1);
    } else if (value > product.inStock) {
      setQuantity(product.inStock);
    } else {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h2>
        <p className="mb-6">Maaf, kami tidak dapat menemukan produk yang Anda cari.</p>
        <Link to="/products" className="btn-primary">
          Kembali ke Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-custom">
        {/* Back button */}
        <Link to="/products" className="flex items-center text-neutral-600 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke Produk
        </Link>

        {/* Product Detail */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="relative">
              <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-auto rounded-lg" onError={handleImageError} loading="lazy" />
              {product.inStock < 1 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                  <span className="text-white font-semibold text-lg">Stok Habis</span>
                </div>
              )}
              {product.isFeatured && <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">Unggulan</div>}
              {product.isBestSeller && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Flame className="h-4 w-4" /> Best Seller
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">{product.name}</h1>

              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={product.rating} size={18} />
                <span className="text-sm text-neutral-500">
                  {product.rating > 0 ? product.rating.toFixed(1) : 'Belum ada rating'}
                  {product.numReviews > 0 && ` (${product.numReviews} ulasan)`}
                </span>
              </div>

              <div className="text-2xl font-bold text-primary-500 mb-4">Rp{product.price.toLocaleString('id-ID')}</div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
                <p className="text-neutral-600">{product.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Kategori</h3>
                <span className="bg-neutral-100 px-3 py-1 rounded-full text-sm">{product.category}</span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Ketersediaan</h3>
                <span className={`font-medium ${product.inStock > 0 ? 'text-green-600' : 'text-red-500'}`}>{product.inStock > 0 ? `Tersedia (${product.inStock} stok)` : 'Stok Habis'}</span>
              </div>

              {product.inStock > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Jumlah</h3>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className={`p-2 border rounded-l-md ${quantity <= 1 ? 'bg-neutral-100 text-neutral-400' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <input type="number" min="1" max={product.inStock} value={quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value))} className="w-16 border-y text-center py-2" />

                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.inStock}
                      className={`p-2 border rounded-r-md ${quantity >= product.inStock ? 'bg-neutral-100 text-neutral-400' : 'bg-white text-neutral-700 hover:bg-neutral-50'}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleAddToCart} disabled={product.inStock < 1} className={`btn ${product.inStock > 0 ? 'btn-primary' : 'bg-neutral-300 cursor-not-allowed text-white'} py-3 px-6 flex-1`}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Tambah ke Keranjang
                </button>

                <Link to="/cart" className="btn-outline py-3 px-6 text-center flex-1">
                  Lihat Keranjang
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Ratings */}
        <ProductReviews productId={product._id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Anda Mungkin Juga Suka</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <div key={related._id} className="product-card">
                  <Link to={`/products/${related._id}`}>
                    <div className="relative aspect-square">
                      <img src={getImageUrl(related.image)} alt={related.name} className="w-full h-full object-cover" onError={handleImageError} loading="lazy" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{related.name}</h3>
                      <p className="text-primary-500 font-bold">Rp{related.price.toLocaleString('id-ID')}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
