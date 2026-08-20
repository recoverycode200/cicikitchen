import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-3xl font-bold text-neutral-800 mt-4">Halaman Tidak Ditemukan</h2>
        <p className="text-neutral-600 mt-2 mb-8">
          Maaf, kami tidak dapat menemukan halaman yang Anda cari.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center">
          <Home className="h-5 w-5 mr-2" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;