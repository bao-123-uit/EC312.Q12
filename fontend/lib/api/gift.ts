import { apiClient } from './client';

// ============ GIFT ============
export interface SendGiftData {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientAddress?: string;
  productId: number;
  quantity?: number;
}

export interface CreateGiftPaymentData {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  productId: number;
  quantity?: number;
}

// Tạo thanh toán PayOS cho quà tặng
export const createGiftPayment = async (data: CreateGiftPaymentData) => {
  const response = await apiClient.post('/gift/create-payment', data);
  return response.data;
};

// Xác minh thanh toán và gửi email
export const verifyGiftPayment = async (giftId: string, orderCode: string) => {
  const response = await apiClient.post('/gift/verify-payment', { giftId, orderCode });
  return response.data;
};

export const sendGift = async (data: SendGiftData) => {
  const response = await apiClient.post('/gift/send', data);
  return response.data;
};

export const verifyGift = async (giftId: string, verificationCode: string) => {
  const response = await apiClient.post('/gift/verify', { giftId, verificationCode });
  return response.data;
};

export const claimGift = async (giftId: string, recipientAddress: string, recipientPhone: string) => {
  const response = await apiClient.post('/gift/claim', { giftId, recipientAddress, recipientPhone });
  return response.data;
};

export const getGiftInfo = async (giftId: string) => {
  const response = await apiClient.get(`/gift/${giftId}`);
  return response.data;
};

export const getSentGifts = async (userId: string) => {
  const response = await apiClient.get(`/gift/sent/${userId}`);
  return response.data;
};

export const getReceivedGifts = async (email: string) => {
  const response = await apiClient.get(`/gift/received/by-email?email=${encodeURIComponent(email)}`);
  return response.data;
};
