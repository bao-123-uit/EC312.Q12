// ============ ADMIN DASHBOARD ============
export const fetchAdminDashboard = async () => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data;
};
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ USERS ============
export const fetchUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

// ============ PRODUCTS ============
export const fetchProducts = async (limit = 10) => {
  const response = await apiClient.get(`/products?limit=${limit}`);
  return response.data;
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

// ============ AUTHENTICATION ============

export const registerCustomer = async (customerData: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}) => {
  try {
    const response = await apiClient.post('/auth/register', {
      email: customerData.email.trim().toLowerCase(),
      password: customerData.password,
      full_name: customerData.full_name.trim(),
      phone: customerData.phone?.trim() || undefined,
    });
    return response.data;
  } catch (error: any) {
    // Trả về error message từ backend
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng ký thất bại',
    };
  }
};

export const loginCustomer = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', { 
      email: email.trim().toLowerCase(), 
      password 
    });
    return response.data;
  } catch (error: any) {
    // Trả về error message từ backend
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng nhập thất bại',
    };
  }
};

export const validateToken = async (token: string) => {
  try {
    const response = await apiClient.post('/auth/validate', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      valid: false,
      message: error.response?.data?.message || 'Token không hợp lệ',
    };
  }
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const response = await apiClient.put('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Đổi mật khẩu thất bại',
    };
  }
};
// ============ REVIEWS ============
export const fetchAllReviews = async (limit = 50) => {
  const response = await apiClient.get(`/reviews?limit=${limit}`);
  return response.data;
};

export const fetchProductReviews = async (productId: number) => {
  const response = await apiClient.get(`/reviews/product/${productId}`);
  return response.data;
};

export const createReview = async (reviewData: {
  product_id: number;
  customer_id?: number;
  customer_name: string;
  customer_email?: string;
  rating: number;
  review_title?: string;
  review_text: string;
}) => {
  const response = await apiClient.post('/reviews', reviewData);
  return response.data;
};

export const approveReview = async (reviewId: number, isApproved: boolean) => {
  const response = await apiClient.put(`/reviews/${reviewId}/approve`, { is_approved: isApproved });
  return response.data;
};

export const deleteReview = async (reviewId: number) => {
  const response = await apiClient.delete(`/reviews/${reviewId}`);
  return response.data;
};

// ============ CONTACT MESSAGES ============
export const fetchAllContacts = async (limit = 50) => {
  const response = await apiClient.get(`/contacts?limit=${limit}`);
  return response.data;
};

export const createContactMessage = async (messageData: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) => {
  const response = await apiClient.post('/contacts', messageData);
  return response.data;
};

export const updateContactStatus = async (id: number, status: string) => {
  const response = await apiClient.put(`/contacts/${id}/status`, { status });
  return response.data;
};

export const deleteContact = async (id: number) => {
  const response = await apiClient.delete(`/contacts/${id}`);
  return response.data;
};

// ============ PAYMENT / MOMO ============
export const createMomoPayment = async (data: {
  amount: string | number;
  orderInfo?: string;
  orderId?: string;
  redirectUrl?: string;
  ipnUrl?: string;
  extraData?: string;
}) => {
  const response = await apiClient.post('/payment/momo', {
    amount: String(data.amount),
    orderInfo: data.orderInfo || 'Thanh toán đơn hàng GoatTech',
    orderId: data.orderId,
    redirectUrl: data.redirectUrl,
    ipnUrl: data.ipnUrl,
    extraData: data.extraData || '',
  });
  return response.data;
};

export const checkMomoPaymentStatus = async (orderId: string) => {
  const response = await apiClient.post('/payment/momo/check-status', { orderId });
  return response.data;
};

export const refundMomoPayment = async (data: {
  orderId: string;
  transId: string;
  amount: string | number;
  description?: string;
}) => {
  const response = await apiClient.post('/payment/momo/refund', {
    orderId: data.orderId,
    transId: data.transId,
    amount: String(data.amount),
    description: data.description || 'Hoàn tiền đơn hàng',
  });
  return response.data;
};

// ============ COLLECTIONS ============
export const fetchAllCollections = async () => {
  const response = await apiClient.get('/collections');
  return response.data;
};

export const fetchCollectionsByType = async (type: string) => {
  const response = await apiClient.get(`/collections/type/${type}`);
  return response.data;
};

export const fetchCollectionBySlug = async (slug: string) => {
  const response = await apiClient.get(`/collections/slug/${slug}`);
  return response.data;
};

export const fetchCollectionProductCounts = async () => {
  const response = await apiClient.get('/collections/counts');
  return response.data;
};

export const fetchProductsByCollection = async (slug: string) => {
  const response = await apiClient.get(`/collections/slug/${slug}/products`);
  return response.data;
};

export const fetchProductCollections = async (productId: number) => {
  const response = await apiClient.get(`/collections/product/${productId}`);
  return response.data;
};

export const addProductToCollection = async (productId: number, collectionId: number) => {
  const response = await apiClient.post('/collections/product', { productId, collectionId });
  return response.data;
};

export const updateProductCollections = async (productId: number, collectionIds: number[]) => {
  const response = await apiClient.put(`/collections/product/${productId}`, { collectionIds });
  return response.data;
};

export const removeProductFromCollection = async (productId: number, collectionId: number) => {
  const response = await apiClient.delete('/collections/product', { 
    data: { productId, collectionId } 
  });
  return response.data;
};

export const createCollection = async (collectionData: {
  collection_name: string;
  collection_slug: string;
  collection_description?: string;
  collection_image?: string;
  collection_gradient?: string;
  collection_icon?: string;
  collection_type?: string;
  display_order?: number;
}) => {
  const response = await apiClient.post('/collections', collectionData);
  return response.data;
};

export const updateCollection = async (id: number, collectionData: any) => {
  const response = await apiClient.put(`/collections/${id}`, collectionData);
  return response.data;
};

export const deleteCollection = async (id: number) => {
  const response = await apiClient.delete(`/collections/${id}`);
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
// ============ SHOPPING_CART ============
/**
 * Lấy giỏ hàng của user hiện tại
 * Yêu cầu: Phải đăng nhập (có token)
 */
export const fetchShoppingCart = async () => {
  try {
    console.log('console log đang được gọi từ fetchShoppingCart');
    // Lấy token từ localStorage
    const customerData = localStorage.getItem('customer');
    console.log(customerData);
    console.log(getAuthHeaders());
    
    if (!customerData) {
      return { success: false, message: 'Chưa đăng nhập', data: [] };
    }
    const customer = JSON.parse(customerData);
    console.log('Customer ID (UUID):', customer.id);
    
    const response = await apiClient.get('/shopping-cart', {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
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
  productId: number;
  // quantity: number;
  quantity:1 ;
  variantId?: number;
}) => {
  try {
    const response = await apiClient.post(
      '/shopping-cart',
      {
        productId: data.productId,
        // quantity: data.quantity || 1,
        quantity: 1,
        variantId: data.variantId || null,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
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
    const response = await apiClient.put(
      `/shopping-cart/${cartId}`,
      { quantity },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error: any) {
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
    const response = await apiClient.delete(`/shopping-cart/${cartId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
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
    const response = await apiClient.delete('/shopping-cart', {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể xóa giỏ hàng',
    };
  }
};

/**
 * Helper: Lấy auth headers
 */
const getAuthHeaders = () => {
  const customerData = localStorage.getItem('customer');
  if (!customerData) return {};
  console.log('🔍 getAuthHeaders called');
  console.log('📦 customerData raw:', customerData);
  try {
    const customer = JSON.parse(customerData);
    // Nếu có access_token thì dùng, không thì dùng id như là simple auth
    console.log('✅ Using Authorization Bearer token',customer.access_token);
    if (customer.access_token) {
      return { Authorization: `Bearer ${customer.access_token}` };
    }
    // Fallback: gửi user-id trong header (backend cần xử lý)
    return { 'X-User-Id': customer.id };
  } catch {
    return {};
  }
};

// ============ ORDERS - ENHANCED ============

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
  subtotal:number,
  payment_method?: string;
  coupon_code?: string;
  customer_note?: string;
}) => {
  try {
    const response = await apiClient.post('/orders', orderData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
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
    const response = await apiClient.get('/orders', {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return [];
  }
};
import { createBrowserClient } from '@supabase/ssr';
const client = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

client.interceptors.request.use(async (config) => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
