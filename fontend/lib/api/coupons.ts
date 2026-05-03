import { apiClient } from './client';

export const validateCoupon = async (payload: {
  code: string;
  subtotal: number;
  shipping_fee: number;
}) => {
  const response = await apiClient.post('/coupons/validate', payload);
  return response.data;
};
