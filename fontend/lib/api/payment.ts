import { apiClient } from './client';

// ============ PAYMENT / MOMO ============
export const createMomoPayment = async (data: {
  amount: string | number;
  orderInfo?: string;
  orderId?: string;
  redirectUrl?: string;
  ipnUrl?: string;
  extraData?: string;
}) => {
  const response = await apiClient.post('/payment/momo', {
    amount: String(data.amount),
    orderInfo: data.orderInfo || 'Thanh toán đơn hàng GoatTech',
    orderId: data.orderId,
    redirectUrl: data.redirectUrl,
    ipnUrl: data.ipnUrl,
    extraData: data.extraData || '',
  });
  return response.data;
};

export const checkMomoPaymentStatus = async (orderId: string) => {
  const response = await apiClient.post('/payment/momo/check-status', { orderId });
  return response.data;
};

export const refundMomoPayment = async (data: {
  orderId: string;
  transId: string;
  amount: string | number;
  description?: string;
}) => {
  const response = await apiClient.post('/payment/momo/refund', {
    orderId: data.orderId,
    transId: data.transId,
    amount: String(data.amount),
    description: data.description || 'Hoàn tiền đơn hàng',
  });
  return response.data;
};
