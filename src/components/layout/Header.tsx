import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { auth, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <ChefHat className="h-6 w-6 md:h-8 md:w-8 text-primary-500" />
          <span className="ml-2 text-lg md:text-xl font-heading font-bold text-primary-500">Cici Kitchen</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="nav-link font-medium hover:text-primary-500 transition-colors">
            Beranda
          </Link>
          <Link to="/products" className="nav-link font-medium hover:text-primary-500 transition-colors">
            Produk
          </Link>
          <Link to="/contact" className="nav-link font-medium hover:text-primary-500 transition-colors">
            Kontak
          </Link>
        </nav>

        {/* Right Side - Cart & Auth */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Cart Icon */}
          <Link to="/cart" className="relative p-2">
            <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-neutral-700 hover:text-primary-500 transition-colors" />
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full text-[10px] md:text-xs">{cart.totalItems > 99 ? '99+' : cart.totalItems}</span>
            )}
          </Link>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center relative">
            {auth.user ? (
              <>
                <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-1 hover:text-primary-500 transition-colors p-2">
                  <span className="font-medium text-sm lg:text-base">{auth.user.name.split(' ')[0]}</span>
                  <User className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 animate-fade-in border border-neutral-200">
                    {auth.user.isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-neutral-100">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-neutral-100">
                      Profile
                    </Link>
                    <Link to="/order-history" className="block px-4 py-2 text-sm hover:bg-neutral-100">
                      Riwayat Order
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline py-1.5 px-3 text-sm">
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-3 text-sm">
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 md:hidden">
            {isMobileMenuOpen ? <X className="h-5 w-5 text-neutral-700" /> : <Menu className="h-5 w-5 text-neutral-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t mt-2 animate-slide-down shadow-lg">
          <div className="container-custom py-4 flex flex-col space-y-1">
            <Link to="/" className="py-3 px-2 font-medium hover:bg-neutral-50 rounded-md transition-colors">
              Beranda
            </Link>
            <Link to="/products" className="py-3 px-2 font-medium hover:bg-neutral-50 rounded-md transition-colors">
              Produk
            </Link>
            <Link to="/contact" className="py-3 px-2 font-medium hover:bg-neutral-50 rounded-md transition-colors">
              Kontak
            </Link>

            <div className="border-t my-2"></div>

            {auth.user ? (
              <>
                <div className="py-2 px-2">
                  <span className="font-medium text-neutral-800">Hi, {auth.user.name.split(' ')[0]}</span>
                </div>
                {auth.user.isAdmin && (
                  <Link to="/admin" className="py-3 px-2 text-primary-500 hover:bg-primary-50 rounded-md transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                <Link to="/profile" className="py-3 px-2 hover:bg-neutral-50 rounded-md transition-colors">
                  Profile
                </Link>
                <Link to="/order-history" className="py-3 px-2 hover:bg-neutral-50 rounded-md transition-colors">
                  Riwayat Order
                </Link>
                <button onClick={handleLogout} className="py-3 px-2 text-left text-red-600 flex items-center hover:bg-red-50 rounded-md transition-colors">
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" className="btn-outline text-center py-3">
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary text-center py-3">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)}></div>}
    </header>
  );
};

export default Header;
