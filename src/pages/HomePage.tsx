import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, Utensils, Truck, Quote, Flame } from 'lucide-react';
import axios from 'axios';
import { Product } from '../types';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface TestimonialData {
  _id: string;
  rating: number;
  comment: string;
  user: { name: string; city?: string };
  product?: { name: string };
  createdAt: string;
}

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center text-primary-500 mb-3">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current' : 'text-neutral-300'}`} />
    ))}
  </div>
);

const avatarColors = ['bg-primary-400', 'bg-secondary-400', 'bg-green-400', 'bg-purple-400', 'bg-orange-400'];

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBestSellers, setLoadingBestSellers] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, reviewsRes, bestSellersRes] = await Promise.allSettled([
          axios.get(`${apiUrl}/api/products?featured=true&limit=4`),
          axios.get(`${apiUrl}/api/reviews?limit=3&sort=-createdAt`),
          axios.get(`${apiUrl}/api/products?bestSeller=true&limit=3`),
        ]);

        if (productsRes.status === 'fulfilled') {
          const data = productsRes.value.data?.data || productsRes.value.data || [];
          setFeaturedProducts(Array.isArray(data) ? data : []);
        }

        if (reviewsRes.status === 'fulfilled') {
          const reviewData = reviewsRes.value.data?.data || reviewsRes.value.data || [];
          setTestimonials(Array.isArray(reviewData) ? reviewData.slice(0, 3) : []);
        }

        if (bestSellersRes.status === 'fulfilled') {
          const data = bestSellersRes.value.data?.data || bestSellersRes.value.data || [];
          setBestSellerProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error mengambil data:', error);
      } finally {
        setLoading(false);
        setLoadingBestSellers(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const displayTestimonials = testimonials;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-16 bg-linear-to-r from-primary-50 to-neutral-100">
        <div className="container-custom flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">Jajanan Pasar Indonesia Terbaik</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-4">
              Makanan Tradisional Diantar ke <span className="text-primary-500">Rumah Anda</span>
            </h1>
            <p className="text-lg text-neutral-700 mb-8">Nikmati jajanan dan makanan tradisional Indonesia yang dibuat dengan cinta menggunakan resep asli dan bahan berkualitas.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="btn-primary text-center py-3 px-6">
                Belanja Sekarang
              </Link>
              <Link to="/contact" className="btn-outline text-center py-3 px-6">
                Hubungi Kami
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <div className="rounded-xl overflow-hidden shadow-xl w-full max-w-md">
              <img src="https://images.pexels.com/photos/7474372/pexels-photo-7474372.jpeg" alt="Makanan Tradisional Indonesia" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Mengapa Memilih Cici Kitchen?</h2>
            <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">Kami mengutamakan kualitas, tradisi, dan pelayanan terbaik untuk memberikan pengalaman jajanan pasar Indonesia yang terbaik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Resep Autentik</h3>
              <p className="text-neutral-600">Resep tradisional turun-temurun, menjaga keaslian rasa Indonesia.</p>
            </div>

            <div className="p-6 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kualitas Premium</h3>
              <p className="text-neutral-600">Hanya menggunakan bahan-bahan terbaik untuk hasil yang memuaskan.</p>
            </div>

            <div className="p-6 border border-neutral-200 rounded-lg hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Pengiriman Cepat</h3>
              <p className="text-neutral-600">Layanan pengiriman cepat dan aman langsung ke pintu Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Seller Menu — hanya tampil jika admin sudah menandai menu best seller */}
      {(loadingBestSellers || bestSellerProducts.length > 0) && (
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
                <Flame className="h-4 w-4" /> Paling Laris
              </span>
              <h2 className="text-3xl font-bold">Menu Best Seller</h2>
              <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">Menu favorit yang paling sering dipesan pelanggan kami.</p>
            </div>

            {loadingBestSellers ? (
              <div className="py-20">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {bestSellerProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-20 bg-neutral-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Produk Unggulan</h2>
            <Link to="/products" className="flex items-center text-primary-500 hover:text-primary-600 font-medium">
              Lihat Semua <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="py-20">
              <LoadingSpinner size="large" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <ShoppingBag className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">Belum ada produk unggulan</h3>
              <p className="text-neutral-600 mb-6">Silakan cek kembali nanti untuk produk unggulan kami!</p>
              <Link to="/products" className="btn-primary">
                Lihat Semua Produk
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials — hanya tampil jika ada data review nyata */}
      {displayTestimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Apa Kata Pelanggan Kami</h2>
              <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">Kepuasan pelanggan adalah prioritas utama kami. Baca pengalaman nyata mereka bersama Cici Kitchen.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayTestimonials.map((t, idx) => {
                const userName = typeof t.user === 'object' ? t.user.name : 'Pelanggan';
                const userCity = typeof t.user === 'object' ? t.user.city : '';

                return (
                  <div key={t._id} className="relative p-6 bg-neutral-50 rounded-xl hover:shadow-md transition-shadow border border-neutral-100">
                    {/* Quote icon */}
                    <Quote className="h-8 w-8 text-primary-200 absolute top-4 right-4" />

                    <StarRatingDisplay rating={t.rating} />

                    <p className="text-neutral-700 mb-5 leading-relaxed text-sm">"{t.comment}"</p>

                    <div className="flex items-center">
                      <div className="min-w-0">
                        <h5 className="font-semibold text-neutral-900 text-sm">{userName}</h5>
                        {userCity && <p className="text-xs text-neutral-500">{userCity}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-500">
        <div className="container-custom">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Siap Memesan?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">Jelajahi berbagai pilihan jajanan pasar tradisional Indonesia dan nikmati kelezatan autentik diantar ke rumah Anda.</p>
            <Link to="/products" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-md font-medium hover:bg-neutral-100 transition-colors">
              Belanja Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
