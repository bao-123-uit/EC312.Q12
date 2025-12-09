import { apiClient } from './auth.api';

// ============ PRODUCTS ============
export const fetchProducts = async (limit = 10) => {
  const response = await apiClient.get(`/products?limit=${limit}`);
  return response.data;
};

export const fetchProductById = async (id: number) => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
};
