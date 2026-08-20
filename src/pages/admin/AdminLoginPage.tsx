import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await login(email, password);
      
      if (user && user.isAdmin) {
        navigate(from, { replace: true });
      } else {
        toast.error('Tidak diizinkan. Hanya akses admin.');
      }
    } catch (error) {
      toast.error('Login gagal. Silakan periksa kredensial Anda.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-primary-500" />
            <Shield className="h-8 w-8 text-neutral-700 -ml-4" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-neutral-900">Login Admin</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Masuk untuk mengakses dashboard admin
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Email Admin
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mt-1"
                placeholder="Masukkan email admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Kata Sandi
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field mt-1"
                placeholder="Masukkan kata sandi"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Masuk...
              </div>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Masuk ke Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;