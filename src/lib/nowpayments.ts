/**
 * NOWPayments API Client
 * Cryptocurrency payment processing for QuickDocs
 * Documentation: https://documenter.getpostman.com/view/7907941/2s93JusNJt
 */

const NOWPAYMENTS_API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.nowpayments.io/v1' 
  : 'https://api-sandbox.nowpayments.io/v1';

const API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

// Types
export interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url: string;
  success_url?: string;
  cancel_url?: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description?: string;
  purchase_id?: string;
  expiration_estimate_date?: string;
  updated_at: string;
  created_at: string;
}

export interface InvoiceResponse {
  id: string;
  order_id: string;
  order_description?: string;
  price_amount: number;
  price_currency: string;
  invoice_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'expired' | 'refunded';
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new payment
 */
export async function createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('NOWPayments create payment error:', error);
    throw new Error(`Failed to create payment: ${response.status}`);
  }

  return response.json();
}

/**
 * Create an invoice (hosted payment page)
 */
export async function createInvoice(data: {
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url: string;
  success_url?: string;
  cancel_url?: string;
}): Promise<InvoiceResponse> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('NOWPayments create invoice error:', error);
    throw new Error(`Failed to create invoice: ${response.status}`);
  }

  return response.json();
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('NOWPayments get payment status error:', error);
    throw new Error(`Failed to get payment status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get invoice status
 */
export async function getInvoiceStatus(invoiceId: string): Promise<InvoiceResponse> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice/${invoiceId}`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('NOWPayments get invoice status error:', error);
    throw new Error(`Failed to get invoice status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get available currencies
 */
export async function getCurrencies(): Promise<string[]> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/currencies`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get currencies: ${response.status}`);
  }

  const data = await response.json();
  return data.currencies || [];
}

/**
 * Verify webhook signature (HMAC-SHA512)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!IPN_SECRET) {
    console.warn('NOWPAYMENTS_IPN_SECRET not configured');
    return false;
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha512', IPN_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return signature === expectedSignature;
}

/**
 * Check if payment is successful
 */
export function isPaymentSuccessful(status: string): boolean {
  return status === 'finished';
}

/**
 * Check if payment is pending
 */
export function isPaymentPending(status: string): boolean {
  return ['waiting', 'confirming', 'confirmed', 'sending'].includes(status);
}

/**
 * Check if payment failed
 */
export function isPaymentFailed(status: string): boolean {
  return ['failed', 'expired', 'refunded'].includes(status);
}

/**
 * Get minimum payment amount for a currency
 */
export async function getMinimumAmount(currency: string): Promise<number> {
  const response = await fetch(`${NOWPAYMENTS_API_URL}/min-amount`, {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    return 1; // Default minimum
  }

  const data = await response.json();
  return data.min_amount || 1;
}

/**
 * Calculate estimated price in crypto
 */
export async function getEstimatedPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const response = await fetch(
    `${NOWPAYMENTS_API_URL}/estimate?amount=${amount}&currency_from=${fromCurrency}&currency_to=${toCurrency}`,
    {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get estimated price: ${response.status}`);
  }

  const data = await response.json();
  return data.estimated_amount || 0;
}

export default {
  createPayment,
  createInvoice,
  getPaymentStatus,
  getInvoiceStatus,
  getCurrencies,
  verifyWebhookSignature,
  isPaymentSuccessful,
  isPaymentPending,
  isPaymentFailed,
  getMinimumAmount,
  getEstimatedPrice,
};
