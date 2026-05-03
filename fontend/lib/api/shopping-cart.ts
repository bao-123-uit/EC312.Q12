import { apiClient, getAuthHeaders } from './client';

// ============ SHOPPING_CART ============
/**
 * Lấy giỏ hàng của user hiện tại
 * Yêu cầu: Phải đăng nhập (có token)
 */
export const fetchShoppingCart = async () => {
  try {
    // Kiểm tra auth headers trước khi gọi API
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Chưa đăng nhập', data: [] };
    }
    
    const response = await apiClient.get('/shopping-cart', { headers });
    return response.data;
  } catch (error: any) {
    // Nếu 401, trả về empty data thay vì throw error
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn', data: [] };
    }
    console.error('Fetch cart error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể tải giỏ hàng',
      data: [],
    };
  }
};

/**
 * Thêm sản phẩm vào giỏ
 */
export const addToShoppingCart = async (data: {
  userId: string;
  productId: number;
  quantity?: number;
  variantId?: number;
  phoneModelId?: number;
  phoneModelName?: string;
}) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập để thêm vào giỏ hàng' };
    }
    
    const response = await apiClient.post(
      '/shopping-cart',
      {
        productId: data.productId,
        quantity: data.quantity || 1,
        variantId: data.variantId || null,
        phoneModelId: data.phoneModelId || null,
        phoneModelName: data.phoneModelName || null,
      },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Add to cart error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể thêm vào giỏ hàng',
    };
  }
};

/**
 * Cập nhật số lượng
 */
export const updateShoppingCart = async (cartId: number, quantity: number) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }
    const response = await apiClient.put(
      `/shopping-cart/${cartId}`,
      { quantity },
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Update cart error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể cập nhật',
    };
  }
};

/**
 * Xóa item khỏi giỏ
 */
export const deleteShoppingCart = async (cartId: number) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }
    const response = await apiClient.delete(`/shopping-cart/${cartId}`, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Delete cart item error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể xóa',
    };
  }
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearShoppingCart = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }
    const response = await apiClient.delete('/shopping-cart', { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Clear cart error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể xóa giỏ hàng',
    };
  }
};
