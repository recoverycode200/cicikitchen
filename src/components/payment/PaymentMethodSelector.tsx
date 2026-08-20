import React from 'react';
import { CreditCard, Truck, Wallet } from 'lucide-react';
import { PaymentMethod } from '../../types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: PaymentMethod.COD,
    name: 'Bayar di Tempat (COD)',
    description: 'Bayar tunai saat pesanan tiba — ongkir Rp5.000',
    icon: <Truck className="h-6 w-6" />,
    badge: null,
  },
  {
    id: PaymentMethod.BANK_MANDIRI,
    name: 'Transfer Bank Mandiri',
    description: 'Transfer manual ke rekening Bank Mandiri — gratis ongkir',
    icon: <CreditCard className="h-6 w-6" />,
    badge: 'Gratis Ongkir',
  },
  {
    id: PaymentMethod.QRIS_MANDIRI,
    name: 'Bayar Online via Midtrans',
    description: 'QRIS, GoPay, OVO, Dana, VA BCA/Mandiri, Kartu Kredit & lebih — gratis ongkir',
    icon: <Wallet className="h-6 w-6" />,
    badge: 'Gratis Ongkir',
  },
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onMethodChange }) => {
  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => (
        <div
          key={method.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedMethod === method.id ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
          onClick={() => onMethodChange(method.id)}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={() => onMethodChange(method.id)}
              className="h-4 w-4 text-primary-500 border-neutral-300 focus:ring-primary-500 shrink-0"
            />
            <div className={`shrink-0 ${selectedMethod === method.id ? 'text-primary-500' : 'text-neutral-400'}`}>{method.icon}</div>
            <div className="grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-neutral-900 text-sm md:text-base">{method.name}</h3>
                {method.badge && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">{method.badge}</span>}
              </div>
              <p className="text-xs md:text-sm text-neutral-500 mt-0.5">{method.description}</p>
            </div>
          </div>

          {/* Midtrans logo strip */}
          {method.id === PaymentMethod.QRIS_MANDIRI && selectedMethod === method.id && (
            <div className="mt-3 pt-3 border-t border-primary-200">
              <p className="text-xs text-neutral-500 mb-2">Metode yang tersedia:</p>
              <div className="flex flex-wrap gap-1.5">
                {['QRIS', 'GoPay', 'OVO', 'Dana', 'ShopeePay', 'VA BCA', 'VA Mandiri', 'Kartu Kredit'].map((m) => (
                  <span key={m} className="text-xs bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;
