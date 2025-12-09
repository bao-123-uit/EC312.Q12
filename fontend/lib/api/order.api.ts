import { apiClient } from './auth.api';

// ============ ORDERS ============
export const fetchOrders = async (limit = 20) => {
  const response = await apiClient.get(`/orders?limit=${limit}`);
  return response.data;
};

export const fetchOrderById = async (id: number) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};
