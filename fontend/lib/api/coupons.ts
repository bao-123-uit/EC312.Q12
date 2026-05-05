import { apiClient } from './client';

export const validateCoupon = async (payload: {
  code: string;
  subtotal: number;
  shipping_fee: number;
}) => {
  const response = await apiClient.post('/coupons/validate', payload);
  return response.data;
};

export const fetchAllCouponsAdmin = async () => {
  const response = await apiClient.get('/coupons/admin/all');
  return response.data;
};

export const createCouponAdmin = async (payload: Record<string, any>) => {
  const response = await apiClient.post('/coupons/admin', payload);
  return response.data;
};

export const updateCouponAdmin = async (couponId: number, payload: Record<string, any>) => {
  const response = await apiClient.put(`/coupons/admin/${couponId}`, payload);
  return response.data;
};

export const deleteCouponAdmin = async (couponId: number) => {
  const response = await apiClient.delete(`/coupons/admin/${couponId}`);
  return response.data;
};
