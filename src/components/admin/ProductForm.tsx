import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface ProductFormProps {
  product?: Product;
  onSubmit: (productData: FormData) => Promise<void>;
  categories: string[];
  isSubmitting: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, categories, isSubmitting }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [bestSellerCount, setBestSellerCount] = useState(0);
  const [loadingBestSellerCount, setLoadingBestSellerCount] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { auth } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL;
  const MAX_BEST_SELLERS = 3;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategory(product.category);
      setInStock(product.inStock.toString());
      setIsFeatured(product.isFeatured);
      setIsBestSeller(product.isBestSeller);

      // Set image preview for existing product
      if (product.image) {
        const imageUrl = product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL}${product.image}`;
        setImagePreview(imageUrl);
      }
    }
  }, [product]);

  // Cek berapa banyak menu best seller yang sudah aktif, supaya slot dibatasi maksimal 3
  useEffect(() => {
    const fetchBestSellerCount = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products?bestSeller=true&limit=50`);
        const data = response.data?.data || [];
        const list: { _id: string }[] = Array.isArray(data) ? data : [];
        // Jangan hitung produk yang sedang diedit, karena statusnya boleh tetap dipertahankan
        const count = product ? list.filter((p) => p._id !== product._id).length : list.length;
        setBestSellerCount(count);
      } catch (error) {
        console.error('Error mengambil jumlah best seller:', error);
      } finally {
        setLoadingBestSellerCount(false);
      }
    };

    fetchBestSellerCount();
  }, [apiUrl, product]);

  const bestSellerSlotFull = bestSellerCount >= MAX_BEST_SELLERS && !isBestSeller;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.');
        return;
      }

      setImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (response.data.success) {
        return response.data.data.path;
      } else {
        throw new Error('Upload gagal');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengupload gambar');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || (!category && !newCategory) || !inStock) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    // For new products, image is required
    if (!product && !image) {
      toast.error('Gambar produk diperlukan untuk produk baru');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', showCategoryInput ? newCategory : category);
      formData.append('inStock', inStock);
      formData.append('isFeatured', isFeatured.toString());
      formData.append('isBestSeller', isBestSeller.toString());

      // Upload image if new image is selected
      if (image) {
        const imagePath = await uploadImageToServer(image);
        formData.append('imagePath', imagePath);
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Error saat submit form:', error);
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'new') {
      setShowCategoryInput(true);
      setCategory('');
    } else {
      setShowCategoryInput(false);
      setCategory(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
            Nama Produk *
          </label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1">
            Harga (Rp) *
          </label>
          <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="1000" className="input-field" required />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
          Deskripsi *
        </label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input-field" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
            Kategori *
          </label>
          {!showCategoryInput ? (
            <select id="category" value={category} onChange={handleCategoryChange} className="input-field" required>
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="new">+ Tambah Kategori Baru</option>
            </select>
          ) : (
            <div className="relative">
              <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-field" placeholder="Masukkan kategori baru" required />
              <button
                type="button"
                onClick={() => {
                  setShowCategoryInput(false);
                  setNewCategory('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="inStock" className="block text-sm font-medium text-neutral-700 mb-1">
            Stok *
          </label>
          <input type="number" id="inStock" value={inStock} onChange={(e) => setInStock(e.target.value)} min="0" className="input-field" required />
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 text-primary-500 rounded border-neutral-300" />
          <label htmlFor="isFeatured" className="ml-2 block text-sm text-neutral-700">
            Tampilkan di halaman utama
          </label>
        </div>
      </div>

      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isBestSeller"
            checked={isBestSeller}
            disabled={loadingBestSellerCount || bestSellerSlotFull}
            onChange={(e) => setIsBestSeller(e.target.checked)}
            className="h-4 w-4 text-primary-500 rounded border-neutral-300 disabled:opacity-50"
          />
          <label htmlFor="isBestSeller" className="ml-2 block text-sm font-medium text-neutral-700">
            Jadikan Menu Best Seller
          </label>
        </div>
        <p className="text-xs text-neutral-500 mt-1 ml-6">
          Maksimal {MAX_BEST_SELLERS} menu best seller aktif sekaligus.{' '}
          {loadingBestSellerCount ? 'Memeriksa slot...' : bestSellerSlotFull ? 'Slot best seller sudah penuh, nonaktifkan salah satu menu lain terlebih dahulu.' : `Slot terisi: ${bestSellerCount}/${MAX_BEST_SELLERS}.`}
        </p>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-neutral-700 mb-1">
          Gambar Produk {!product && '*'}
        </label>
        <input type="file" id="image" onChange={handleImageChange} className="input-field pt-1" accept="image/*" required={!product} disabled={uploadingImage} />
        <p className="text-xs text-neutral-500 mt-1">Format yang didukung: JPG, PNG, WEBP, GIF. Maksimal 5MB.</p>

        {uploadingImage && (
          <div className="mt-2 flex items-center text-primary-500">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
            Mengupload gambar...
          </div>
        )}

        {imagePreview && !uploadingImage && (
          <div className="mt-2">
            <p className="text-sm text-neutral-500 mb-1">Preview Gambar:</p>
            <img src={imagePreview} alt="Preview produk" className="w-32 h-32 object-cover rounded-md border border-neutral-200" />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={() => window.history.back()} className="btn border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">
          Batal
        </button>
        <button type="submit" disabled={isSubmitting || uploadingImage} className="btn-primary">
          {isSubmitting || uploadingImage ? (
            <div className="flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              {uploadingImage ? 'Mengupload...' : 'Menyimpan...'}
            </div>
          ) : product ? (
            'Perbarui Produk'
          ) : (
            'Tambah Produk'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
