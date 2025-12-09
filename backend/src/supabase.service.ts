import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  );

  // ============ CUSTOMERS ============
  async getCustomers() {
    const { data, error } = await this.supabase.from('customers').select('*');
    return { data, error };
  }

  async getCustomerById(customerId: number) {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('customer_id', customerId)
      .single();
    return { data, error };
  }

  async createCustomer(customerData: any) {
    const { data, error } = await this.supabase
      .from('customers')
      .insert([customerData])
      .select();
    return { data, error };
  }

  async getCustomerByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }

  async loginCustomer(email: string, password: string) {
    const { data, error } = await this.supabase
      .from('customers')
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

  async getProductsByCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);
    return { data, error };
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

  // ============ REVIEWS ============
  async getProductReviews(productId: number) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true);
    return { data, error };
  }

  async createReview(reviewData: any) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .insert([reviewData])
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
}
