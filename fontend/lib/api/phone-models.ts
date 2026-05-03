import { apiClient } from './client';

// ============ PHONE MODELS (Dòng máy điện thoại) ============

// Lấy tất cả dòng máy (grouped by brand)
export const fetchAllPhoneModels = async () => {
  try {
    const response = await apiClient.get('/phone-models');
    return response.data;
  } catch (error) {
    console.error('fetchAllPhoneModels error:', error);
    return { success: false, data: [] };
  }
};

// Lấy dòng máy phổ biến
export const fetchPopularPhoneModels = async () => {
  try {
    const response = await apiClient.get('/phone-models/popular');
    return response.data;
  } catch (error) {
    console.error('fetchPopularPhoneModels error:', error);
    return { success: false, data: [] };
  }
};

// Lấy dòng máy theo hãng
export const fetchPhoneModelsByBrand = async (brandName: string) => {
  try {
    const response = await apiClient.get(`/phone-models/brand/${encodeURIComponent(brandName)}`);
    return response.data;
  } catch (error) {
    console.error('fetchPhoneModelsByBrand error:', error);
    return { success: false, data: [] };
  }
};

// Tìm kiếm dòng máy
export const searchPhoneModels = async (keyword: string) => {
  try {
    const response = await apiClient.get(`/phone-models/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  } catch (error) {
    console.error('searchPhoneModels error:', error);
    return { success: false, data: [] };
  }
};

// Lấy dòng máy tương thích với sản phẩm
export const fetchCompatiblePhoneModels = async (productId: number) => {
  if (!Number.isFinite(productId)) {
    return { success: false, data: [] };
  }
  try {
    const response = await apiClient.get(`/phone-models/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('fetchCompatiblePhoneModels error:', error);
    return { success: false, data: [] };
  }
};

// Lấy chi tiết dòng máy
export const fetchPhoneModelById = async (modelId: number) => {
  try {
    const response = await apiClient.get(`/phone-models/${modelId}`);
    return response.data;
  } catch (error) {
    console.error('fetchPhoneModelById error:', error);
    return null;
  }
};

// Admin: Tạo dòng máy mới
export const createPhoneModel = async (modelData: {
  brand_name: string;
  model_name: string;
  model_code?: string;
  release_year?: number;
  screen_size?: string;
  is_popular?: boolean;
  is_active?: boolean;
}) => {
  const response = await apiClient.post('/phone-models', modelData);
  return response.data;
};

// Admin: Cập nhật dòng máy
export const updatePhoneModel = async (modelId: number, modelData: any) => {
  const response = await apiClient.put(`/phone-models/${modelId}`, modelData);
  return response.data;
};

// Admin: Xóa dòng máy
export const deletePhoneModel = async (modelId: number) => {
  const response = await apiClient.delete(`/phone-models/${modelId}`);
  return response.data;
};

// Admin: Set dòng máy tương thích cho sản phẩm
export const setProductCompatibility = async (productId: number, phoneModelIds: number[]) => {
  const response = await apiClient.post(`/phone-models/product/${productId}/compatibility`, {
    phoneModelIds,
  });
  return response.data;
};
