import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Cart, CartItem, Product } from '../types';
import { toast } from 'react-toastify';

interface CartContextProps {
  cart: Cart;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  // Antrian toast — dijalankan setelah render selesai
  const toastQueue = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (toastQueue.current.length > 0) {
      toastQueue.current.forEach((fn) => fn());
      toastQueue.current = [];
    }
  });

  // Load cart dari localStorage saat pertama kali
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Simpan cart ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    return { totalItems, totalPrice };
  };

  const addToCart = (product: Product, quantity: number) => {
    // Tentukan pesan toast DI LUAR updater setCart, supaya tidak
    // ikut terpanggil dua kali saat React StrictMode double-invoke
    // fungsi updater di development.
    let toastAction: (() => void) | null = null;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((item) => item.product._id === product._id);
      let updatedItems;

      if (existingItemIndex >= 0) {
        updatedItems = [...prevCart.items];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        if (newQuantity > product.inStock) {
          toastAction = () => toast.warning(`Stok hanya tersisa ${product.inStock} item.`);
          updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity: product.inStock };
        } else {
          updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity: newQuantity };
          toastAction = () => toast.success(`Jumlah ${product.name} diperbarui!`);
        }
      } else {
        if (quantity > product.inStock) {
          quantity = product.inStock;
          toastAction = () => toast.warning(`Stok hanya tersisa ${product.inStock} item.`);
        } else {
          toastAction = () => toast.success(`${product.name} ditambahkan ke keranjang!`);
        }
        updatedItems = [...prevCart.items, { product, quantity }];
      }

      const { totalItems, totalPrice } = calculateTotals(updatedItems);
      return { items: updatedItems, totalItems, totalPrice };
    });

    if (toastAction) {
      toastQueue.current.push(toastAction);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.product._id !== productId);
      const { totalItems, totalPrice } = calculateTotals(updatedItems);
      return { items: updatedItems, totalItems, totalPrice };
    });
    toastQueue.current.push(() => toast.info('Item dihapus dari keranjang'));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    let toastAction: (() => void) | null = null;

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) => {
        if (item.product._id === productId) {
          if (quantity > item.product.inStock) {
            toastAction = () => toast.warning(`Stok hanya tersisa ${item.product.inStock} item.`);
            return { ...item, quantity: item.product.inStock };
          }
          return { ...item, quantity };
        }
        return item;
      });
      const { totalItems, totalPrice } = calculateTotals(updatedItems);
      return { items: updatedItems, totalItems, totalPrice };
    });

    if (toastAction) {
      toastQueue.current.push(toastAction);
    }
  };

  const clearCart = () => {
    setCart({ items: [], totalItems: 0, totalPrice: 0 });
    toastQueue.current.push(() => toast.info('Keranjang dikosongkan'));
  };

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>{children}</CartContext.Provider>;
};
