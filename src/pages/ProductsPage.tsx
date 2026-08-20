import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingBag, X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { Product } from '../types';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Get query params
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');

    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);

    // Fetch products based on filters
    fetchProducts(searchParam || '', categoryParam || '');

    // Fetch categories
    fetchCategories();
  }, [location.search, apiUrl]);

  const fetchProducts = async (search: string, category: string) => {
    setLoading(true);
    try {
      let url = `${apiUrl}/api/products?`;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      url += params.toString();

      const response = await axios.get(url);

      // Fallback kalau struktur response berbeda
      const data = response.data?.data || response.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products/categories`);

      // Fallback kalau struktur response berbeda
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams(searchTerm, selectedCategory);
    setShowMobileFilters(false);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateQueryParams(searchTerm, category);
    setShowCategoryFilter(false);
    setShowMobileFilters(false);
  };

  const updateQueryParams = (search: string, category: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    navigate(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowMobileFilters(false);
    navigate('/products');
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      snacks: 'Camilan',
      desserts: 'Makanan Penutup',
      'rice-dishes': 'Hidangan Nasi',
      drinks: 'Minuman',
      traditional: 'Tradisional',
      modern: 'Modern',
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="py-6 md:py-10">
      <div className="container-custom">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Produk Kami</h1>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full flex items-center justify-between p-3 bg-white border border-neutral-300 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-neutral-600" />
              <span className="font-medium">Filter & Pencarian</span>
            </div>
            <ChevronDown className={`h-5 w-5 text-neutral-600 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter & Pencarian</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Cari Produk</label>
                <div className="relative">
                  <input type="text" placeholder="Masukkan nama produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 w-full" />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                </div>
              </form>

              {/* Mobile Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-3">Kategori</label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${!selectedCategory ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedCategory === category ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-neutral-200 hover:bg-neutral-50'}`}
                    >
                      {getCategoryDisplayName(category)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Filter Actions */}
              <div className="flex gap-3">
                <button onClick={clearFilters} className="flex-1 py-3 px-4 border border-neutral-300 rounded-lg font-medium hover:bg-neutral-50">
                  Reset Filter
                </button>
                <button onClick={handleSearch} className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600">
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Search and Filter Bar */}
        <div className="hidden md:block mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <form onSubmit={handleSearch} className="grow">
              <div className="relative">
                <input type="text" placeholder="Cari produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 w-full" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              </div>
            </form>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setShowCategoryFilter(!showCategoryFilter)} className="btn bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 flex items-center min-w-35 justify-between">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="truncate">{selectedCategory ? getCategoryDisplayName(selectedCategory) : 'Kategori'}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showCategoryFilter ? 'rotate-180' : ''}`} />
                </button>

                {showCategoryFilter && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-neutral-200">
                    <ul className="max-h-64 overflow-y-auto">
                      <li>
                        <button onClick={() => handleCategoryChange('')} className={`px-4 py-3 text-sm w-full text-left hover:bg-neutral-100 transition-colors ${!selectedCategory ? 'font-semibold text-primary-500 bg-primary-50' : ''}`}>
                          Semua Kategori
                        </button>
                      </li>
                      {categories.map((category) => (
                        <li key={category}>
                          <button
                            onClick={() => handleCategoryChange(category)}
                            className={`px-4 py-3 text-sm w-full text-left hover:bg-neutral-100 transition-colors ${selectedCategory === category ? 'font-semibold text-primary-500 bg-primary-50' : ''}`}
                          >
                            {getCategoryDisplayName(category)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {(searchTerm || selectedCategory) && (
                <button onClick={clearFilters} className="text-primary-500 hover:text-primary-600 text-sm font-medium whitespace-nowrap">
                  Hapus Filter
                </button>
              )}
            </div>
          </div>

          {/* Active Filters - Desktop */}
          {(searchTerm || selectedCategory) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-neutral-600">Filter aktif:</span>
              {searchTerm && (
                <div className="bg-neutral-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>Pencarian: {searchTerm}</span>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      updateQueryParams('', selectedCategory);
                    }}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className="bg-neutral-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <span>Kategori: {getCategoryDisplayName(selectedCategory)}</span>
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      updateQueryParams(searchTerm, '');
                    }}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Filters - Mobile */}
        {(searchTerm || selectedCategory) && (
          <div className="md:hidden mb-4 p-3 bg-white rounded-lg border border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Filter Aktif:</span>
              <button onClick={clearFilters} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                Hapus Semua
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <span>"{searchTerm}"</span>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      updateQueryParams('', selectedCategory);
                    }}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <span>{getCategoryDisplayName(selectedCategory)}</span>
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      updateQueryParams(searchTerm, '');
                    }}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Listing */}
        {loading ? (
          <div className="py-12 md:py-20 text-center">
            <LoadingSpinner size="large" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-neutral-600">Menampilkan {products.length} produk</div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<ShoppingBag className="h-12 w-12" />}
            title="Tidak ada produk ditemukan"
            description="Kami tidak dapat menemukan produk yang sesuai dengan kriteria Anda. Coba sesuaikan filter atau periksa kembali nanti."
            actionText="Hapus Filter"
            onActionClick={clearFilters}
          />
        )}
      </div>

      {/* Click outside to close category filter */}
      {showCategoryFilter && <div className="fixed inset-0 z-10" onClick={() => setShowCategoryFilter(false)}></div>}
    </div>
  );
};

export default ProductsPage;
