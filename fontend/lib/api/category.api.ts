import { apiClient } from './auth.api';

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
