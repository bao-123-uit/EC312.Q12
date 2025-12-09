import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ CUSTOMERS ============
export const fetchCustomers = async () => {
  const response = await apiClient.get('/customers');
  return response.data;
};

// ============ PRODUCTS ============
export const fetchProducts = async (limit = 10) => {
  const response = await apiClient.get(`/products?limit=${limit}`);
  return response.data;
};

// ============ ORDERS ============
export const fetchOrders = async (limit = 20) => {
  const response = await apiClient.get(`/orders?limit=${limit}`);
  return response.data;
};

// ============ CATEGORIES ============
export const fetchCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const fetchRootCategories = async () => {
  const response = await apiClient.get('/categories/root');
  return response.data;
};

export const fetchCategoryById = async (id: number) => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data;
};

export const fetchCategoryBySlug = async (slug: string) => {
  const response = await apiClient.get(`/categories/slug/${slug}`);
  return response.data;
};

export const fetchChildCategories = async (parentId: number) => {
  const response = await apiClient.get(`/categories/${parentId}/children`);
  return response.data;
};

// ============ AUTHENTICATION ============
export const registerCustomer = async (customerData: {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  address?: string;
}) => {
  const response = await apiClient.post('/auth/register', customerData);
  return response.data;
};

export const loginCustomer = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

// ============ PAYMENT / MOMO ============
export const createMomoPayment = async (amount: string, orderInfo: string) => {
  const response = await apiClient.post('/payment/momo', {
    amount,
    orderInfo,
  });
  return response.data;
};

// ============ ERROR HANDLING ============
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

