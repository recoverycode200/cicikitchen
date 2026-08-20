import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    setLoading(false);
    
    // Show success message
    alert('Terima kasih atas pesan Anda. Kami akan segera menghubungi Anda kembali!');
  };

  return (
    <div className="py-10">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Hubungi Kami</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Mari Berkenalan</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Kunjungi Kami</h3>
                    <p className="text-neutral-600">
                      Perum. Bumi Rancamanyar Blok C2 No.12
                      <br />
                      Sukahati, Citeureup
                      <br />
                      Kab. Bogor, Jawa Barat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-primary-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Telepon Kami</h3>
                    <p className="text-neutral-600">+62 812 3456 7890</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-primary-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">Email Kami</h3>
                    <p className="text-neutral-600">info@cici-kitchen.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Jam Operasional</h2>
                <div className="space-y-2 text-neutral-600">
                  <div className="flex justify-between">
                    <span>Senin - Jumat</span>
                    <span>08:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabtu</span>
                    <span>09:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between text-primary-500">
                    <span>Minggu</span>
                    <span>Tutup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Lokasi</h2>
              <div className="aspect-video bg-neutral-100 rounded-md overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=-6.5144889,106.8868550&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Kirim Pesan</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nama Lengkap
                </label>
                <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="Masukkan nama lengkap Anda" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Alamat Email
                </label>
                <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="Masukkan alamat email Anda" />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-1">
                  Subjek
                </label>
                <input type="text" id="subject" name="subject" required value={formData.subject} onChange={handleChange} className="input-field" placeholder="Tentang apa pesan ini?" />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
                  Pesan
                </label>
                <textarea id="message" name="message" rows={6} required value={formData.message} onChange={handleChange} className="input-field" placeholder="Tulis pesan Anda di sini..." />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Mengirim...
                  </div>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Kirim Pesan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;