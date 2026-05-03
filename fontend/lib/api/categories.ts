import { apiClient } from './client';

// ============ CATEGORIES ============
export const fetchCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

export const syncCategoryListFromDatabase = async () => {
  const response = await apiClient.post('/categories/sync-from-db');
  return response.data;
};

export const fetchCategoriesWithCount = async () => {
  const response = await apiClient.get('/categories/with-count');
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

export const createCategory = async (categoryData: {
  category_name: string;
  category_slug: string;
  description?: string;
  parent_category_id?: number | null;
  display_order?: number;
  is_active?: boolean;
}) => {
  const response = await apiClient.post('/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id: number, categoryData: any) => {
  const response = await apiClient.put(`/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};
