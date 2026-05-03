import { apiClient, getAuthHeaders } from './client';

// ============ WISHLIST ============
export const fetchWishlist = async () => {
  try {
    // Kiểm tra auth headers trước khi gọi API
    const headers = getAuthHeaders();
    if (!headers) {
      return [];
    }
    const response = await apiClient.get('/wishlist', { headers });
    return response.data;
  } catch (error: any) {
    // Nếu 401, trả về empty array thay vì throw
    if (error.response?.status === 401) {
      return [];
    }
    console.error('Fetch wishlist error:', error);
    return [];
  }
};

export const fetchWishlistProductIds = async (): Promise<number[]> => {
  try {
    // Kiểm tra auth headers trước khi gọi API
    const headers = getAuthHeaders();
    if (!headers) {
      return [];
    }
    const response = await apiClient.get('/wishlist/product-ids', { headers });
    return response.data;
  } catch (error: any) {
    // Nếu 401, trả về empty array thay vì throw
    if (error.response?.status === 401) {
      return [];
    }
    console.error('Fetch wishlist product ids error:', error);
    return [];
  }
};

export const addToWishlist = async (productId: number) => {
  try {
    // Kiểm tra auth headers trước khi gọi API
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập để thêm vào yêu thích' };
    }
    const response = await apiClient.post(`/wishlist/${productId}`, {}, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Add to wishlist error:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId: number) => {
  try {
    // Kiểm tra auth headers trước khi gọi API
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }
    const response = await apiClient.delete(`/wishlist/${productId}`, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Remove from wishlist error:', error);
    throw error;
  }
};

export const toggleWishlist = async (productId: number) => {
  try {
    // Kiểm tra auth headers trước khi gọi API
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập để thêm vào yêu thích' };
    }
    const response = await apiClient.post(`/wishlist/toggle/${productId}`, {}, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Toggle wishlist error:', error);
    throw error;
  }
};

export const checkIsInWishlist = async (productId: number): Promise<boolean> => {
  try {
    // Kiểm tra auth headers trước khi gọi API
    const headers = getAuthHeaders();
    if (!headers) {
      return false;
    }
    const response = await apiClient.get(`/wishlist/check/${productId}`, { headers });
    return response.data.isInWishlist;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return false;
    }
    console.error('Check wishlist error:', error);
    return false;
  }
};
