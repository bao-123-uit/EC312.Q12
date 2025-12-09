import { apiClient } from './auth.api';

// ============ CUSTOMERS ============
export const fetchCustomers = async () => {
  const response = await apiClient.get('/customers');
  return response.data;
};
