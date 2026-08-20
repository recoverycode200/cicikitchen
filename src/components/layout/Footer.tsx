import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center">
              <ChefHat className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-heading font-bold text-white">Cici Kitchen</span>
            </Link>
            <p className="mt-4 text-neutral-300">Menghadirkan jajanan pasar otentik Indonesia ke depan pintu rumah Anda. Jajanan pasar kami dibuat dengan penuh cinta menggunakan resep tradisional dan bahan-bahan terbaik.</p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-primary-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Tautan Cepat</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Produk
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Buat Akun
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=snacks" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Makanan ringan
                </Link>
              </li>
              <li>
                <Link to="/products?category=desserts" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Makanan penutup
                </Link>
              </li>
              <li>
                <Link to="/products?category=rice-dishes" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Hidangan Nasi
                </Link>
              </li>
              <li>
                <Link to="/products?category=drinks" className="text-neutral-300 hover:text-primary-500 transition-colors">
                  Minuman
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-heading font-semibold mb-4">Hubungi Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-500 mt-0.5 mr-2 shrink-0" />
                <span className="text-neutral-300">Perum. Bumi Rancamanyar Blok C2 No.12, Sukahati, Citeureup, Kab. Bogor, Jawa Barat.</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary-500 mt-0.5 mr-2 shrink-0" />
                <span className="text-neutral-300">+62 812 3456 7890</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-primary-500 mt-0.5 mr-2 shrink-0" />
                <span className="text-neutral-300">info@cici-kitchen.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-10 pt-6 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Cici Kitchen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
