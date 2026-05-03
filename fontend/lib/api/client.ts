import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ ERROR HANDLING ============
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Không log lỗi 401 (token hết hạn/không hợp lệ) vì đã được xử lý trong các hàm
    if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * Helper: Lấy auth headers
 * Trả về null nếu không có token hợp lệ
 */
export const getAuthHeaders = (): { Authorization: string } | null => {
  if (typeof window === 'undefined') return null;
  
  const customerData = localStorage.getItem('customer');
  if (!customerData) return null;
  
  try {
    const customer = JSON.parse(customerData);
    // Chỉ trả về headers nếu có access_token
    if (customer.access_token) {
      return { Authorization: `Bearer ${customer.access_token}` };
    }
    return null;
  } catch {
    return null;
  }
};

export default apiClient;
