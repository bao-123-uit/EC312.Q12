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
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
}) => {
  try {
    // Ghép first_name + last_name thành full_name nếu cần
    const fullName = customerData.full_name || 
      `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim();
    
    const response = await apiClient.post('/auth/register', {
      email: customerData.email.trim().toLowerCase(),
      password: customerData.password,
      full_name: fullName,
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
    // Không log lỗi 401 (token hết hạn/không hợp lệ) vì đã được xử lý trong các hàm
    if (error.response?.status !== 401) {
      console.error('API Error:', error.response?.data || error.message);
    }
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

/**
 * Helper: Lấy auth headers
 * Trả về null nếu không có token hợp lệ
 */
const getAuthHeaders = (): { Authorization: string } | null => {
  const customerData = localStorage.getItem('customer');
  if (!customerData) return null;
  
  try {
    const customer = JSON.parse(customerData);
    // Chỉ trả về headers nếu có access_token
    if (customer.access_token) {
      return { Authorization: `Bearer ${customer.access_token}` };
    }
    return null;
  } catch {
    return null;
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

// ============ GIFT ============
export interface SendGiftData {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientAddress?: string;
  productId: number;
  quantity?: number;
}

export interface CreateGiftPaymentData {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  productId: number;
  quantity?: number;
}

// Tạo thanh toán PayOS cho quà tặng
export const createGiftPayment = async (data: CreateGiftPaymentData) => {
  const response = await apiClient.post('/gift/create-payment', data);
  return response.data;
};

// Xác minh thanh toán và gửi email
export const verifyGiftPayment = async (giftId: string, orderCode: string) => {
  const response = await apiClient.post('/gift/verify-payment', { giftId, orderCode });
  return response.data;
};

export const sendGift = async (data: SendGiftData) => {
  const response = await apiClient.post('/gift/send', data);
  return response.data;
};

export const verifyGift = async (giftId: string, verificationCode: string) => {
  const response = await apiClient.post('/gift/verify', { giftId, verificationCode });
  return response.data;
};

export const claimGift = async (giftId: string, recipientAddress: string, recipientPhone: string) => {
  const response = await apiClient.post('/gift/claim', { giftId, recipientAddress, recipientPhone });
  return response.data;
};

export const getGiftInfo = async (giftId: string) => {
  const response = await apiClient.get(`/gift/${giftId}`);
  return response.data;
};

export const getSentGifts = async (userId: string) => {
  const response = await apiClient.get(`/gift/sent/${userId}`);
  return response.data;
};

export const getReceivedGifts = async (email: string) => {
  const response = await apiClient.get(`/gift/received/by-email?email=${encodeURIComponent(email)}`);
  return response.data;
};

// ============ CUSTOM DESIGNS ============
export interface CreateDesignData {
  userId?: string;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  templateId?: string;
  phoneModel: string;
  designData: any;
  previewImageBase64?: string;
}

export interface SubmitDesignData {
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
}

// Lấy danh sách phone templates
export const getPhoneTemplates = async () => {
  const response = await apiClient.get('/designs/templates');
  return response.data;
};

// Tạo thiết kế mới
export const createDesign = async (data: CreateDesignData) => {
  const response = await apiClient.post('/designs', data);
  return response.data;
};

// Lấy thiết kế theo ID
export const getDesignById = async (designId: string) => {
  const response = await apiClient.get(`/designs/${designId}`);
  return response.data;
};

// Cập nhật thiết kế
export const updateDesign = async (designId: string, data: any) => {
  const response = await apiClient.put(`/designs/${designId}`, data);
  return response.data;
};

// Gửi thiết kế cho admin
export const submitDesign = async (designId: string, data: SubmitDesignData) => {
  const response = await apiClient.post(`/designs/${designId}/submit`, data);
  return response.data;
};

// Lấy thiết kế của user
export const getUserDesigns = async (userId: string) => {
  const response = await apiClient.get(`/designs/user/${userId}`);
  return response.data;
};

// Admin: Lấy tất cả thiết kế
export const getAllDesigns = async (status?: string) => {
  const url = status ? `/designs/admin/all?status=${status}` : '/designs/admin/all';
  const response = await apiClient.get(url);
  return response.data;
};

// Admin: Duyệt thiết kế
export const approveDesign = async (designId: string, adminNotes?: string) => {
  const response = await apiClient.put(`/designs/admin/${designId}/approve`, { adminNotes });
  return response.data;
};

// Admin: Từ chối thiết kế
export const rejectDesign = async (designId: string, adminNotes: string) => {
  const response = await apiClient.put(`/designs/admin/${designId}/reject`, { adminNotes });
  return response.data;
};

// Xóa thiết kế
export const deleteDesign = async (designId: string) => {
  const response = await apiClient.delete(`/designs/${designId}`);
  return response.data;
};

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
