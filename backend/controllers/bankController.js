import asyncHandler from 'express-async-handler';

// @desc    Ambil info rekening bank untuk transfer manual
// @route   GET /api/payments/bank-info
// @access  Private (harus login untuk lihat nomor rekening)
const getBankInfo = asyncHandler(async (req, res) => {
  // Nomor rekening dibaca dari ENV — tidak pernah ada di kode frontend
  const bankInfo = {
    bankName: process.env.BANK_NAME || 'Bank Mandiri',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER,
    accountName: process.env.BANK_ACCOUNT_NAME,
    whatsapp: process.env.BANK_WHATSAPP,
  };

  if (!bankInfo.accountNumber) {
    res.status(500);
    throw new Error('Konfigurasi bank belum diatur di server');
  }

  res.json({ success: true, data: bankInfo });
});

export { getBankInfo };
