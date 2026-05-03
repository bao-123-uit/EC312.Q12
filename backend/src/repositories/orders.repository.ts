import { getSupabaseClient } from './base.repository';

/**
 * Orders Repository - Quản lý đơn hàng và order items
 */
export class OrdersRepository {
  private get supabase() { return getSupabaseClient(); }

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

  async updatePaymentStatusByOrderNumber(orderNumber: string, paymentStatus: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ payment_status: paymentStatus, updated_at: new Date() })
      .eq('order_number', orderNumber)
      .select();
    return { data, error };
  }

  async updateOrderStatusByOrderNumber(orderNumber: string, orderStatus: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .update({ order_status: orderStatus, updated_at: new Date() })
      .eq('order_number', orderNumber)
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

  // ============ ORDERS - ENHANCED ============
  async createFullOrder(orderData: {
    customer_id: string;
    order_number: string;
    subtotal: number;
    discount_amount?: number;
    shipping_fee?: number;
    total_amount: number;
    payment_method?: string;
    shipping_address_id?: number;
    customer_note?: string;
    shipping_full_name?: string;
    shipping_phone?: string;
    shipping_address?: string;
    shipping_ward?: string;
    shipping_district?: string;
    shipping_city?: string;
  }) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert([{
        ...orderData,
        order_status: 'pending',
        payment_status: 'unpaid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select();
    return { data, error };
  }

  async createFullOrderItem(itemData: {
    order_id: number;
    product_id: number;
    product_name: string;
    variant_name?: string;
    sku: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
    total_price: number;
    phone_model_id?: number | null;
    phone_model_name?: string | null;
  }) {
    const { data, error } = await this.supabase
      .from('order_items')
      .insert([itemData])
      .select();
    return { data, error };
  }

  async getOrderByNumber(orderNumber: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();
    return { data, error };
  }

  async getOrderWithItems(orderId: number) {
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError) return { data: null, error: orderError };

    const { data: items, error: itemsError } = await this.supabase
      .from('order_items')
      .select(`
        *,
        products (
          product_id,
          product_name,
          product_slug,
          price,
          sale_price,
          image_url,
          product_images (
            image_url,
            is_primary
          )
        )
      `)
      .eq('order_id', orderId);

    if (itemsError) return { data: order, error: itemsError };

    const itemsWithImage = (items || []).map((item: any) => {
      let imageUrl = item.products?.image_url || null;
      if (item.products?.product_images && item.products.product_images.length > 0) {
        const primary = item.products.product_images.find((img: any) => img.is_primary) || item.products.product_images[0];
        if (primary?.image_url) imageUrl = primary.image_url;
      }
      return { ...item, image_url: imageUrl };
    });

    return { data: { ...order, items: itemsWithImage }, error: null };
  }

  async getOrderWithItemsByNumber(orderNumber: string) {
    const { data: order, error: orderError } = await this.supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError || !order) return { data: null, error: orderError };

    const { data: items, error: itemsError } = await this.supabase
      .from('order_items')
      .select(`
        *,
        products (
          product_id,
          product_name,
          product_slug,
          image_url,
          product_images (
            image_url,
            is_primary
          )
        )
      `)
      .eq('order_id', order.order_id);

    const itemsWithImage = (items || []).map((item: any) => {
      let imageUrl = item.products?.image_url || null;
      if (item.products?.product_images && item.products.product_images.length > 0) {
        const primary = item.products.product_images.find((img: any) => img.is_primary) || item.products.product_images[0];
        if (primary?.image_url) imageUrl = primary.image_url;
      }
      return { ...item, image_url: imageUrl };
    });

    return { data: { ...order, items: itemsWithImage }, error: itemsError };
  }
}

// Export singleton instance
export const ordersRepository = new OrdersRepository();
