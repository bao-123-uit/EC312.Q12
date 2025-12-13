import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  );

  // ============ USERS ============
  async getCustomers() {
    const { data, error } = await this.supabase.from('users').select('*');
    return { data, error };
  }

  async getCustomerById(customerId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', customerId)
      .single();
    return { data, error };
  }

  async createCustomer(customerData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([customerData])
      .select();
    return { data, error };
  }

  async getCustomerByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }

  async loginCustomer(email: string, password: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .single();
    return { data, error };
  }

  async createCustomerAddress(addressData: any) {
    const { data, error } = await this.supabase
      .from('customer_addresses')
      .insert([addressData])
      .select();
    return { data, error };
  }

  async getCustomerAddresses(customerId: number) {
    const { data, error } = await this.supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false });
    return { data, error };
  }

  // ============ PRODUCTS ============
  async getProducts(limit = 10) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .limit(limit);
    return { data, error };
  }

  async getProductById(productId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('product_id', productId)
      .single();
    return { data, error };
  }

  async createProduct(productData: any) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([productData])
      .select();
    return { data, error };
  }

  async updateProduct(productId: number, productData: any) {
    const { data, error } = await this.supabase
      .from('products')
      .update(productData)
      .eq('product_id', productId)
      .select();
    return { data, error };
  }

  async deleteProduct(productId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .delete()
      .eq('product_id', productId);
    return { data, error };
  }

  async getProductsByCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);
    return { data, error };
  }

  // ============ PRODUCTS BY SEASON ============
  async getProductsBySeason(season: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('season', season)
      .eq('status', 'active');
    return { data, error };
  }

  async getSeasonProductCounts() {
    const seasons = ['noel', 'valentine', 'tet'];
    const counts: Record<string, number> = {};
    
    for (const season of seasons) {
      const { data, error } = await this.supabase
        .from('products')
        .select('product_id', { count: 'exact' })
        .eq('season', season)
        .eq('status', 'active');
      
      counts[season] = data?.length || 0;
    }
    
    return counts;
  }

  // ============ ORDERS ============
  async getOrders(limit = 20) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async getOrderById(orderId: number) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();
    return { data, error };
  }

  async getOrdersByCustomer(customerId: number) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async createOrder(orderData: any) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([orderData])
      .select();
    return { data, error };
  }

  async updateOrderStatus(orderId: number, newStatus: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ order_status: newStatus, updated_at: new Date() })
      .eq('order_id', orderId)
      .select();
    return { data, error };
  }

  async updatePaymentStatus(orderId: number, paymentStatus: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date() })
      .eq('order_id', orderId)
      .select();
    return { data, error };
  }

  // ============ ORDER ITEMS ============
  async getOrderItems(orderId: number) {
    const { data, error } = await this.supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    return { data, error };
  }

  async createOrderItem(itemData: any) {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert([itemData])
      .select();
    return { data, error };
  }

  // ============ PAYMENT TRANSACTIONS ============
  async createPaymentTransaction(transactionData: any) {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .insert([transactionData])
      .select();
    return { data, error };
  }

  async getPaymentTransactionsByOrder(orderId: number) {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId);
    return { data, error };
  }

  // ============ INVENTORY ============
  async getInventory(productId: number) {
    const { data, error } = await this.supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId);
    return { data, error };
  }

  async updateInventory(inventoryId: number, updates: any) {
    const { data, error } = await this.supabase
      .from('inventory')
      .update(updates)
      .eq('inventory_id', inventoryId)
      .select();
    return { data, error };
  }

  // ============ CATEGORIES ============
  async getCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async getCategoriesWithProductCount() {
    // Lấy tất cả categories
    const { data: categories, error: catError } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (catError) return { data: null, error: catError };

    // Lấy tất cả sản phẩm (không lọc status để đếm hết)
    const { data: products, error: prodError } = await this.supabase
      .from('products')
      .select('category_id, status');

    if (prodError) return { data: categories, error: prodError };

    // Đếm số sản phẩm theo category_id (chấp nhận status: active, Active, hoặc không có status)
    const productCountMap: Record<number, number> = {};
    products?.forEach((p: any) => {
      if (p.category_id) {
        const status = (p.status || '').toLowerCase();
        // Đếm nếu status là active hoặc không có status
        if (status === 'active' || status === '' || !p.status) {
          productCountMap[p.category_id] = (productCountMap[p.category_id] || 0) + 1;
        }
      }
    });

    // Gắn số lượng sản phẩm vào từng category
    const categoriesWithCount = categories?.map((cat: any) => ({
      ...cat,
      product_count: productCountMap[cat.category_id] || 0
    }));

    return { data: categoriesWithCount, error: null };
  }

  async getCategoryById(categoryId: number) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('category_id', categoryId)
      .single();
    return { data, error };
  }

  async getCategoryBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('category_slug', slug)
      .eq('is_active', true)
      .single();
    return { data, error };
  }

  async getRootCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .is('parent_category_id', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async getChildCategories(parentId: number) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('parent_category_id', parentId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async createCategory(categoryData: any) {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([categoryData])
      .select();
    return { data, error };
  }

  async updateCategory(categoryId: number, categoryData: any) {
    const { data, error } = await this.supabase
      .from('categories')
      .update(categoryData)
      .eq('category_id', categoryId)
      .select();
    return { data, error };
  }

  async deleteCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId);
    return { data, error };
  }

  // ============ REVIEWS ============
  async getAllReviews(limit = 50) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async getProductReviews(productId: number) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async getReviewById(reviewId: number) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .select('*')
      .eq('review_id', reviewId)
      .single();
    return { data, error };
  }

  async createReview(reviewData: any) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .insert([reviewData])
      .select();
    return { data, error };
  }

  async updateReview(reviewId: number, reviewData: any) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .update(reviewData)
      .eq('review_id', reviewId)
      .select();
    return { data, error };
  }

  async deleteReview(reviewId: number) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .delete()
      .eq('review_id', reviewId);
    return { data, error };
  }

  async approveReview(reviewId: number, isApproved: boolean) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .update({ is_approved: isApproved })
      .eq('review_id', reviewId)
      .select();
    return { data, error };
  }

  // ============ WISHLIST ============
  async getWishlist(customerId: number) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .select('*')
      .eq('customer_id', customerId);
    return { data, error };
  }

  async addToWishlist(customerId: number, productId: number, variantId?: number) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .insert([{ customer_id: customerId, product_id: productId, variant_id: variantId || null }])
      .select();
    return { data, error };
  }

  async removeFromWishlist(customerId: number, productId: number) {
    const { error } = await this.supabase
      .from('wishlists')
      .delete()
      .eq('customer_id', customerId)
      .eq('product_id', productId);
    return { error };
  }

  // ============ COUPONS ============
  async getCoupon(couponCode: string) {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode)
      .eq('is_active', true)
      .single();
    return { data, error };
  }

  // ============ GENERIC QUERY (for any table) ============
  async query(tableName: string, filters?: any, limit?: number) {
    let query = this.supabase.from(tableName).select('*');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    return { data, error };
  }

  // ============ CONTACT MESSAGES ============
  async getAllContactMessages(limit = 50) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async getContactMessageById(id: number) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  async createContactMessage(messageData: any) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .insert([messageData])
      .select();
    return { data, error };
  }

  async updateContactMessageStatus(id: number, status: string) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    return { data, error };
  }

  async deleteContactMessage(id: number) {
    const { data, error } = await this.supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
    return { data, error };
  }
}
