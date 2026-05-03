import { apiClient } from './client';

// ============ USERS ============
export const fetchUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};
