import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { User, AuthUser } from '../types';
import { toast } from 'react-toastify';

interface AuthContextProps {
  auth: AuthUser;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthUser>({ user: null, token: null });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Load user data from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Check if token is expired
            const decoded: any = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
              throw new Error('Token expired');
            }

            // Get user data
            const res = await axios.get(`${apiUrl}/api/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setAuth({
              user: res.data.data,
              token,
            });
          } catch (error) {
            localStorage.removeItem('token');
            setAuth({ user: null, token: null });
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [apiUrl]);

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      const { token, ...user } = res.data.data;

      localStorage.setItem('token', token);
      setAuth({ token, user });

      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${apiUrl}/api/auth/register`, { name, email, password });
      const { token, user } = res.data.data;

      localStorage.setItem('token', token);
      setAuth({ token, user });
      toast.success('Registrasi berhasil!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ user: null, token: null });
    toast.info('Anda telah keluar dari akun');
  };

  return <AuthContext.Provider value={{ auth, login, register, logout, loading, error }}>{children}</AuthContext.Provider>;
};
