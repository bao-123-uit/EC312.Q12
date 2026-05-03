import { apiClient } from './client';

// ============ ADMIN DASHBOARD ============
export const fetchAdminDashboard = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};
