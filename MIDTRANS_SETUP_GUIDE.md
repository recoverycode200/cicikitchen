# Panduan Integrasi Midtrans QRIS - Cici Kitchen

Dokumen ini menjelaskan cara mengintegrasikan payment gateway Midtrans dengan metode pembayaran QRIS ke website Cici Kitchen Anda.

## Daftar Isi
1. [Setup Akun Midtrans](#setup-akun-midtrans)
2. [Konfigurasi Backend](#konfigurasi-backend)
3. [Konfigurasi Frontend](#konfigurasi-frontend)
4. [Testing Payment Flow](#testing-payment-flow)
5. [Deployment ke Production](#deployment-ke-production)
6. [Troubleshooting](#troubleshooting)

---

## Setup Akun Midtrans

### Langkah 1: Membuat Akun Midtrans

1. Kunjungi [https://dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Klik "Register" dan isi data bisnis Anda
3. Verifikasi email Anda
4. Login ke dashboard Midtrans

### Langkah 2: Mendapatkan API Keys

1. Di dashboard Midtrans, navigasi ke **Settings > Access Keys**
2. Anda akan menemukan:
   - **Server Key**: Untuk backend (JANGAN dibagikan)
   - **Client Key**: Untuk frontend (boleh publik)
3. Salin kedua key tersebut

### Langkah 3: Memilih Environment

- **Sandbox**: Untuk testing (default saat pertama kali mendaftar)
- **Production**: Untuk live transactions

Untuk testing, gunakan Sandbox terlebih dahulu.

---

## Konfigurasi Backend

### Langkah 1: Update File .env

Edit file `backend/.env` dengan konfigurasi Midtrans Anda:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cici-kitchen

# Midtrans Configuration
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=your_midtrans_server_key_here
MIDTRANS_CLIENT_KEY=your_midtrans_client_key_here
```

**Penjelasan:**
- `MIDTRANS_IS_PRODUCTION=false` untuk Sandbox (testing)
- `MIDTRANS_IS_PRODUCTION=true` untuk Production (live)
- `MIDTRANS_SERVER_KEY`: Copy dari dashboard Midtrans (Server Key)
- `MIDTRANS_CLIENT_KEY`: Copy dari dashboard Midtrans (Client Key)

### Langkah 2: Verifikasi Backend Dependencies

Pastikan dependencies sudah terinstall:

```bash
cd backend
npm install
```

Dependencies yang sudah ditambahkan:
- `midtrans-client`: SDK Midtrans untuk Node.js
- `axios`: HTTP client
- `dotenv`: Environment variables

### Langkah 3: Struktur File Backend

File-file yang sudah dibuat/diupdate:

```
backend/
├── controllers/
│   └── paymentController.js          (BARU)
├── routes/
│   └── paymentRoutes.js              (BARU)
├── models/
│   └── orderModel.js                 (UPDATE: tambah payment fields)
├── server.js                         (UPDATE: import payment routes)
├── .env                              (UPDATE: Midtrans credentials)
└── .env.example                      (BARU: template .env)
```

### Payment Controller Functions:

1. **createTransaction**: Membuat transaction token Midtrans
   - POST `/api/payments/create-transaction`
   - Diakses oleh: User yang sudah login
   - Response: Token untuk Snap.js

2. **handleWebhook**: Menangani webhook dari Midtrans
   - POST `/api/payments/webhook`
   - Diakses oleh: Midtrans server
   - Fungsi: Update status pembayaran di database

3. **checkPaymentStatus**: Mengecek status pembayaran
   - GET `/api/payments/status/:orderId`
   - Diakses oleh: User yang sudah login
   - Response: Status pembayaran terkini

---

## Konfigurasi Frontend

### Langkah 1: Update index.html

File `index.html` sudah diupdate dengan Midtrans Snap script:

```html
<script src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key="your_midtrans_client_key"></script>
```

**PENTING**: Ganti `your_midtrans_client_key` dengan Client Key Anda dari dashboard Midtrans.

Untuk Production, gunakan:
```html
<script src="https://app.midtrans.com/snap/snap.js" 
        data-client-key="your_production_client_key"></script>
```

### Langkah 2: Update Frontend Environment

Buat file `.env` di root folder (jika belum ada):

```env
VITE_API_URL=http://localhost:5000
```

Untuk production, ganti dengan URL backend production Anda:
```env
VITE_API_URL=https://api.yourdomain.com
```

### Langkah 3: Frontend Components

File-file yang sudah dibuat/diupdate:

```
src/
├── components/payment/
│   ├── PaymentMethodSelector.tsx     (UPDATE: tambah QRIS option)
│   ├── MidtransPaymentModal.tsx      (BARU)
│   └── PaymentStatus.tsx             (BARU)
├── pages/
│   └── CheckoutPage.tsx              (UPDATE: integrasi Midtrans)
└── types/
    └── index.ts                      (UPDATE: payment types)
```

### Component Description:

1. **MidtransPaymentModal**: Modal untuk membuka Snap payment form
2. **PaymentStatus**: Menampilkan status pembayaran (pending/success/failed)
3. **PaymentMethodSelector**: Updated dengan opsi QRIS

---

## Testing Payment Flow

### Langkah 1: Setup Data Testing di Midtrans

1. Buka dashboard Midtrans
2. Navigasi ke **Settings > API Integration**
3. Copy nilai-nilai untuk testing:
   - Test credentials sudah tersedia

### Langkah 2: Test QRIS Payment

1. Buka website di browser: `http://localhost:3000` (frontend)
2. Navigasi ke halaman Checkout
3. Pilih metode pembayaran: **QRIS (Scan & Bayar)**
4. Isi informasi pengiriman
5. Klik **Buat Pesanan**
6. Modal pembayaran Midtrans akan muncul
7. Klik **Bayar Sekarang**
8. Scanning QR Code dengan e-wallet (simulasi di Sandbox)

### Langkah 3: Simulasi Pembayaran Sandbox

Di environment Sandbox, Anda bisa simulasi pembayaran:

1. Gunakan test account yang disediakan Midtrans
2. Atau gunakan kartu kredit test:
   - **Card Number**: 4111111111111111
   - **CVV**: 123
   - **Exp Date**: 12/25 (masa depan)

Untuk QRIS di Sandbox, Midtrans menyediakan simulasi QR yang bisa di-scan.

### Langkah 4: Verifikasi di Dashboard

1. Login ke dashboard Midtrans
2. Navigasi ke **Transactions**
3. Cek status transaksi yang baru saja dibuat
4. Verifikasi bahwa order status berubah menjadi "processing"

---

## Payment Status Flow

Berikut adalah flow status pembayaran:

```
Order Created (unpaid)
    ↓
User Memilih QRIS
    ↓
Klik "Bayar Sekarang" → createTransaction()
    ↓
Midtrans Modal Muncul (token diterima)
    ↓
User Scan QRIS
    ↓
Pembayaran Diproses
    ↓
Webhook dari Midtrans → handleWebhook()
    ↓
Order Status Updated:
  - settlement/completed → paymentStatus: 'completed'
  - pending → paymentStatus: 'pending'
  - failed/expired → paymentStatus: 'failed'
```

---

## API Endpoints

### 1. Create Transaction
```
POST /api/payments/create-transaction
Headers: Authorization: Bearer {token}
Body: {
  orderId: string,
  totalPrice: number,
  firstName: string,
  lastName: string,
  email: string,
  phone: string
}
Response: {
  success: boolean,
  token: string,
  redirectUrl: string,
  orderId: string
}
```

### 2. Webhook Handler
```
POST /api/payments/webhook
Body: Payload dari Midtrans (automatic)
Response: {
  success: boolean,
  message: string
}
```

**PENTING**: Daftarkan webhook URL ini di dashboard Midtrans:
- Settings > Configuration > Notification URL
- URL: `https://yourdomain.com/api/payments/webhook`

### 3. Check Payment Status
```
GET /api/payments/status/:orderId
Headers: Authorization: Bearer {token}
Response: {
  success: boolean,
  paymentStatus: string,
  transactionStatus: string,
  order: {
    id: string,
    totalPrice: number,
    paymentStatus: string
  }
}
```

---

## Deployment ke Production

### Langkah 1: Setup Production di Midtrans

1. Di dashboard Midtrans, switch ke **Production** environment
2. Verifikasi akun dan bisnis Anda
3. Copy Production API keys

### Langkah 2: Update Credentials

**Backend (.env Production):**
```env
NODE_ENV=production
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=prod_server_key_anda
MIDTRANS_CLIENT_KEY=prod_client_key_anda
```

**Frontend (index.html Production):**
```html
<script src="https://app.midtrans.com/snap/snap.js" 
        data-client-key="prod_client_key_anda"></script>
```

### Langkah 3: Daftarkan Webhook URL

1. Login ke dashboard Midtrans
2. Settings → Configuration
3. Notification URL: `https://yourdomain.com/api/payments/webhook`
4. Save

### Langkah 4: Test di Production

1. Lakukan transaksi kecil dengan QRIS real
2. Verifikasi di dashboard Midtrans
3. Pastikan webhook berfungsi dengan benar

---

## Troubleshooting

### Error: "Client Key not set"

**Penyebab**: Midtrans Snap script belum di-load atau Client Key belum benar

**Solusi**:
1. Verifikasi Client Key di index.html sudah benar
2. Refresh browser (hard refresh: Ctrl+Shift+R)
3. Check browser console untuk error details

### Error: "Transaction not found"

**Penyebab**: Order ID tidak valid atau belum tersimpan di database

**Solusi**:
1. Pastikan order dibuat dengan sukses sebelum membuka payment modal
2. Check backend logs untuk melihat proses order creation
3. Verifikasi MongoDB connection

### Webhook tidak diterima

**Penyebab**: Webhook URL tidak terdaftar atau tidak accessible

**Solusi**:
1. Daftarkan webhook URL di dashboard Midtrans
2. Pastikan domain accessible dari internet (bukan localhost)
3. Check server logs untuk incoming webhook requests
4. Verify HTTPS jika production

### CORS Error

**Penyebab**: Frontend dan backend di domain berbeda

**Solusi**: Backend sudah configure CORS, pastikan:
```js
app.use(cors());
```

### Payment Modal tidak muncul

**Penyebab**: Snap.js tidak ter-load atau token invalid

**Solusi**:
1. Check browser console untuk error messages
2. Pastikan token diterima dari backend
3. Verifikasi token format (string)
4. Check network tab untuk `/create-transaction` response

---

## File Reference

### Backend Files yang diubah/dibuat:

1. **`controllers/paymentController.js`** (BARU)
   - Logic untuk create transaction, handle webhook, check status
   
2. **`routes/paymentRoutes.js`** (BARU)
   - Route definitions untuk payment endpoints

3. **`models/orderModel.js`** (UPDATE)
   - Tambah fields: `paymentStatus`, `midtransTransactionId`, `paymentDetails`

4. **`server.js`** (UPDATE)
   - Import dan register payment routes

5. **`.env`** (UPDATE)
   - Midtrans credentials

6. **`.env.example`** (BARU)
   - Template untuk .env file

### Frontend Files yang diubah/dibuat:

1. **`components/payment/MidtransPaymentModal.tsx`** (BARU)
   - Modal component untuk payment

2. **`components/payment/PaymentStatus.tsx`** (BARU)
   - Component untuk menampilkan payment status

3. **`components/payment/PaymentMethodSelector.tsx`** (UPDATE)
   - Tambah QRIS payment option

4. **`pages/CheckoutPage.tsx`** (UPDATE)
   - Integrasi Midtrans modal dan payment flow

5. **`types/index.ts`** (UPDATE)
   - Tambah payment status types dan interfaces

6. **`index.html`** (UPDATE)
   - Tambah Midtrans Snap script

---

## Support & Resources

- **Dokumentasi Midtrans**: https://docs.midtrans.com
- **Midtrans GitHub**: https://github.com/midtrans
- **Midtrans Dashboard**: https://dashboard.midtrans.com
- **Community Forum**: https://forum.midtrans.com

---

**Selamat! Anda sudah siap menggunakan Midtrans QRIS untuk menerima pembayaran. Jika ada pertanyaan, silakan hubungi support Midtrans atau developer yang membantu project ini.**

---

*Last Updated: 2024*
*Version: 1.0*
