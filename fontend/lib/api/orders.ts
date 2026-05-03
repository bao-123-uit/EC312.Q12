import { apiClient, getAuthHeaders } from './client';

// ============ ORDERS ============
export const fetchOrders = async (limit = 20) => {
  try {
    // Gửi token nếu có
    const customerData = localStorage.getItem('customer');
    const headers: Record<string, string> = {};
    
    if (customerData) {
      const customer = JSON.parse(customerData);
      if (customer.access_token) {
        headers['Authorization'] = `Bearer ${customer.access_token}`;
      }
    }
    
    const response = await apiClient.get(`/orders?limit=${limit}`, { headers });
    return response.data;
  } catch (error: any) {
    console.error('fetchOrders error:', error);
    return [];
  }
};

// Lấy tất cả orders cho admin
export const fetchAllOrdersAdmin = async () => {
  try {
    const customerData = localStorage.getItem('customer');
    const headers: Record<string, string> = {};
    
    if (customerData) {
      const customer = JSON.parse(customerData);
      if (customer.access_token) {
        headers['Authorization'] = `Bearer ${customer.access_token}`;
      }
    }
    
    const response = await apiClient.get('/orders/admin/all', { headers });
    return response.data;
  } catch (error: any) {
    console.error('fetchAllOrdersAdmin error:', error);
    return [];
  }
};

/**
 * Tạo đơn hàng mới
 */
export const createOrder = async (orderData: {
  items: {
    product_id: number;
    variant_id?: number;
    product_name: string;
    variant_name?: string;
    sku?: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }[];
  shipping_address?: {
    full_name: string;
    phone: string;
    address_line1: string;
    ward?: string;
    district?: string;
    city: string;
  };
  subtotal: number;
  payment_method?: string;
  coupon_code?: string;
  customer_note?: string;
}) => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      return { success: false, message: 'Vui lòng đăng nhập để đặt hàng' };
    }
    const response = await apiClient.post('/orders', orderData, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Phiên đăng nhập hết hạn' };
    }
    console.error('Create order error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể tạo đơn hàng',
    };
  }
};

/**
 * Lấy đơn hàng theo order number
 */
export const fetchOrderByNumber = async (orderNumber: string) => {
  try {
    const response = await apiClient.get(`/orders/number/${orderNumber}`);
    return response.data;
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return null;
  }
};

/**
 * Lấy danh sách đơn hàng của customer
 */
export const fetchMyOrders = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers) {
      return [];
    }
    const response = await apiClient.get('/orders', { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      return [];
    }
    console.error('Fetch orders error:', error);
    return [];
  }
};
