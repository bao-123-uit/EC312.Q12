import { apiClient } from './auth.api';

// ============ PAYOS PAYMENT ============

export interface PayOSPaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CreatePayOSPaymentDto {
  orderCode: number;
  amount: number;
  description: string;
  items?: PayOSPaymentItem[];
  cancelUrl?: string;
  returnUrl?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  expiredAt?: number;
}

export interface PayOSPaymentResponse {
  success: boolean;
  data: {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
  };
}

/**
 * Tạo thanh toán PayOS
 */
export const createPayOSPayment = async (paymentData: CreatePayOSPaymentDto): Promise<PayOSPaymentResponse> => {
  const response = await apiClient.post('/payment/payos', paymentData);
  return response.data;
};

/**
 * Kiểm tra trạng thái thanh toán PayOS
 */
export const checkPayOSPaymentStatus = async (orderCode: string | number) => {
  const response = await apiClient.get(`/payment/payos/check-status?orderCode=${orderCode}`);
  return response.data;
};

/**
 * Hủy thanh toán PayOS
 */
export const cancelPayOSPayment = async (orderCode: string | number, reason?: string) => {
  const response = await apiClient.post('/payment/payos/cancel', { orderCode, reason });
  return response.data;
};

/**
 * Xác minh và cập nhật trạng thái từ PayOS return URL
 */
export const verifyPayOSReturn = async (orderCode: string | number, orderNumber: string) => {
  const response = await apiClient.post('/payment/payos/verify-return', { orderCode, orderNumber });
  return response.data;
};

// ============ MOMO PAYMENT ============

export interface CreateMoMoPaymentDto {
  amount: number;
  orderId?: string;
  orderInfo?: string;
  redirectUrl?: string;
  ipnUrl?: string;
  extraData?: string;
}

/**
 * Tạo thanh toán MoMo
 */
export const createMoMoPayment = async (paymentData: CreateMoMoPaymentDto) => {
  const response = await apiClient.post('/payment/momo', paymentData);
  return response.data;
};

/**
 * Kiểm tra trạng thái thanh toán MoMo
 */
export const checkMoMoPaymentStatus = async (orderId: string) => {
  const response = await apiClient.post('/payment/momo/check-status', { orderId });
  return response.data;
};

/**
 * Hoàn tiền MoMo
 */
export const refundMoMoPayment = async (orderId: string, transId: string, amount: number, description?: string) => {
  const response = await apiClient.post('/payment/momo/refund', { orderId, transId, amount, description });
  return response.data;
};
