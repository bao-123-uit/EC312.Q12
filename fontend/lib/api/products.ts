import { apiClient } from './client';

// ============ PRODUCTS ============
export const fetchProducts = async (limit = 10) => {
  const response = await apiClient.get(`/products?limit=${limit}`);
  return response.data;
};

export const fetchProductById = async (id: number) => {
  try {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Fetch product by id error:', error);
    return null;
  }
};

export const createProduct = async (productData: any) => {
  const response = await apiClient.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: any) => {
  const response = await apiClient.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// ============ PRODUCTS BY SEASON ============
export const fetchProductsBySeason = async (season: string) => {
  const response = await apiClient.get(`/products/season/${season}`);
  return response.data;
};

export const fetchSeasonProductCounts = async () => {
  const response = await apiClient.get('/products/season/counts');
  return response.data;
};
