// Midtrans Snap.js — TypeScript declarations
// Letakkan file ini di src/types/midtrans.d.ts

export interface MidtransResult {
  order_id: string;
  payment_type: string;
  transaction_id: string;
  transaction_status: string;
  fraud_status?: string;
  gross_amount?: string;
  status_message?: string;
  finish_redirect_url?: string;
}

export interface SnapPayOptions {
  onSuccess?: (result: MidtransResult) => void;
  onPending?: (result: MidtransResult) => void;
  onError?: (result: MidtransResult) => void;
  onClose?: () => void;
  language?: 'id' | 'en';
  uiMode?: 'deeplink' | 'qr' | 'auto';
  autoCloseDelay?: number;
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: SnapPayOptions) => void;
      hide: () => void;
    };
  }
}
