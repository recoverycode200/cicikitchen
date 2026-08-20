import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Product } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import ProductForm from '../../components/admin/ProductForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { auth } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products`);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products/categories`);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      };

      // Convert FormData to regular object for JSON
      const productData: any = {};
      formData.forEach((value, key) => {
        productData[key] = value;
      });

      if (editingProduct) {
        await axios.put(`${apiUrl}/api/products/${editingProduct._id}`, productData, config);
        toast.success('Produk berhasil diperbarui');
      } else {
        const response = await axios.post(`${apiUrl}/api/products`, productData, config);
        console.log('Response:', response.data);
        toast.success('Produk berhasil ditambahkan');
      }

      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
      fetchCategories();
    } catch (error: any) {
      console.error('Error:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Gagal menyimpan produk';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    try {
      await axios.delete(`${apiUrl}/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk');
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${apiUrl}${imagePath}`;
  };

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Produk</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Produk
        </button>
      </div>

      <p className="text-sm text-neutral-500 mb-6">
        Menu Best Seller aktif: <span className="font-semibold text-neutral-700">{products.filter((p) => p.isBestSeller).length}/3</span>
      </p>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <ProductForm product={editingProduct} onSubmit={handleSubmit} categories={categories} isSubmitting={submitting} />
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input type="text" placeholder="Cari produk..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Best Seller</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">Rp{product.price.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${product.inStock > 10 ? 'text-green-600' : product.inStock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>{product.inStock} unit</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{product.isFeatured ? <span className="text-primary-500">Ya</span> : <span className="text-neutral-500">Tidak</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.isBestSeller ? <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-600">Best Seller</span> : <span className="text-neutral-500">Tidak</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                          className="text-primary-500 hover:text-primary-600 mr-3"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Tidak ada produk</h3>
                <p className="text-neutral-500">Coba sesuaikan pencarian Anda atau tambahkan produk baru.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProducts;
