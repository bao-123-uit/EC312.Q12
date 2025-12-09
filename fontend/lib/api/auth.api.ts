import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
