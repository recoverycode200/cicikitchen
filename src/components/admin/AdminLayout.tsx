import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, LayoutDashboard, ShoppingBag, Package, LogOut, Menu, X, ArrowLeft, BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside
        className={`bg-neutral-800 text-white fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'
        } w-64 md:flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="p-4 flex items-center justify-between border-b border-neutral-700">
          <Link to="/admin" className="flex items-center">
            <ChefHat className="h-8 w-8 text-primary-500" />
            {isSidebarOpen && <span className="ml-2 text-xl font-heading font-bold">Admin</span>}
          </Link>
          <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-neutral-700 md:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar content */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          <Link to="/admin" className={`flex items-center p-3 rounded-md transition-colors ${isActive('/admin') ? 'bg-primary-500 text-white' : 'hover:bg-neutral-700'}`}>
            <LayoutDashboard className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link to="/admin/products" className={`flex items-center p-3 rounded-md transition-colors ${isActive('/admin/products') ? 'bg-primary-500 text-white' : 'hover:bg-neutral-700'}`}>
            <ShoppingBag className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Products</span>}
          </Link>
          <Link to="/admin/orders" className={`flex items-center p-3 rounded-md transition-colors ${isActive('/admin/orders') ? 'bg-primary-500 text-white' : 'hover:bg-neutral-700'}`}>
            <Package className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Orders</span>}
          </Link>
          <Link to="/admin/reports" className={`flex items-center p-3 rounded-md transition-colors ${isActive('/admin/reports') ? 'bg-primary-500 text-white' : 'hover:bg-neutral-700'}`}>
            <BarChart2 className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Laporan</span>}
          </Link>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-neutral-700">
          <button onClick={handleLogout} className="flex items-center p-2 w-full rounded-md hover:bg-neutral-700 transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>

          <Link to="/" className="flex items-center p-2 mt-2 rounded-md hover:bg-neutral-700 transition-colors">
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3">Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-neutral-100 md:hidden">
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center">
              <span className="ml-2 text-sm text-neutral-500">Admin Panel</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default AdminLayout;
