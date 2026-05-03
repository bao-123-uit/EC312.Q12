import { apiClient } from './client';

export const fetchPromotions = async () => {
  const response = await apiClient.get('/promotions');
  return response.data;
};
