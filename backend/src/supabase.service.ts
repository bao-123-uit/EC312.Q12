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
      .select(`
        *,
        categories (
          category_id,
          category_name
        ),
        product_images (
          image_id,
          image_url,
          is_primary,
          display_order
        )
      `)
      .neq('status', 'deleted')
      .limit(limit);

    const flattenedData = data?.map((p: any) => {
      // tìm ảnh chính
      const primaryImage =
        p.product_images?.find((img: any) => img.is_primary) ||
        p.product_images?.[0];

      return {
        ...p,
        category_name: p.categories?.category_name || 'Khác',
        image_url: primaryImage?.image_url || null,
        images: p.product_images || [],
      };
    });

    return { data: flattenedData, error };
  }


  async getProductById(productId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories (
          category_id,
          category_name
        )
      `)
      .eq('product_id', productId)
      .single();
    
    // Flatten category name
    const flattenedData = data ? {
      ...data,
      category_name: data.categories?.category_name || 'Khác'
    } : null;
    
    return { data: flattenedData, error };;
  }

  async createProduct(productData: any) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([productData])
      .select();
    return { data, error };
  }

  async updateProduct(productId: number, productData: any) {
    console.log('=== SUPABASE UPDATE ===');
    console.log('Updating product_id:', productId);
    console.log('Raw data received:', JSON.stringify(productData, null, 2));
    
    // Chỉ lấy các field hợp lệ trong bảng products
    const validFields = [
      'product_name', 'product_slug', 'category_id', 'brand_id', 'sku',
      'description', 'short_description', 'price', 'sale_price', 'cost_price',
      'is_featured', 'is_new', 'is_bestseller', 'is_trending', 'status',
      'meta_title', 'meta_description', 'meta_keywords', 'image_url', 'season'
    ];
    
    const cleanData: any = {};
    for (const field of validFields) {
      if (productData[field] !== undefined) {
        // Xử lý các giá trị rỗng
        if (productData[field] === '' || productData[field] === null) {
          // Cho phép null cho các field optional
          if (['category_id', 'brand_id', 'sale_price', 'cost_price', 'season', 'image_url'].includes(field)) {
            cleanData[field] = null;
          }
          // Bỏ qua string rỗng cho các field khác
        } else {
          cleanData[field] = productData[field];
        }
      }
    }
    
    // Thêm updated_at
    cleanData.updated_at = new Date().toISOString();
    
    console.log('Clean data to update:', JSON.stringify(cleanData, null, 2));
    
    const { data, error } = await this.supabase
      .from('products')
      .update(cleanData)
      .eq('product_id', productId)
      .select();
    
    console.log('Supabase response - data:', JSON.stringify(data, null, 2));
    console.log('Supabase response - error:', error);
    
    return { data, error };
  }

  // Soft delete - đổi status thành 'deleted' thay vì xóa hẳn
  // Vì sản phẩm có thể đã có trong order_items
  async deleteProduct(productId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ status: 'deleted' })
      .eq('product_id', productId)
      .select();
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
  // ============ ORDERS - ENHANCED ============

// Tạo order với đầy đủ thông tin
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

// Tạo order item với đầy đủ thông tin
async createFullOrderItem(itemData: {
  order_id: number;
  product_id: number;
  //variant_id?: number;
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

// Lấy order theo order_number
async getOrderByNumber(orderNumber: string) {
  const { data, error } = await this.supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();
  return { data, error };
}

// Lấy order với items
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
        sale_price
      )
    `)
    .eq('order_id', orderId);

  if (itemsError) return { data: order, error: itemsError };

  return { 
    data: { ...order, items: items || [] }, 
    error: null 
  };
}

// Lấy order với items theo order_number
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
        product_slug
      )
    `)
    .eq('order_id', order.order_id);

  return { 
    data: { ...order, items: items || [] }, 
    error: itemsError 
  };
}

// ============ COLLECTIONS - ENHANCED ============

// Lấy tất cả collections (từ design_collections)
async getAllDesignCollections() {
  const { data, error } = await this.supabase
    .from('design_collections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return { data, error };
}

// Lấy collection theo type
async getDesignCollectionsByType(type: string) {
  // type: 'normal' hoặc 'seasonal'
  const { data, error } = await this.supabase
    .from('design_collections')
    .select('*')
    .eq('is_active', true)
    .ilike('collection_name', type === 'seasonal' ? '%Noel%|%Valentine%|%Tết%' : '%')
    .order('display_order', { ascending: true });
  return { data, error };
}

// Lấy collection theo slug
async getDesignCollectionBySlug(slug: string) {
  const { data, error } = await this.supabase
    .from('design_collections')
    .select('*')
    .eq('collection_slug', slug)
    .eq('is_active', true)
    .single();
  return { data, error };
}

// Lấy sản phẩm trong collection
async getProductsByDesignCollection(collectionId: number) {
  const { data: pcData, error: pcError } = await this.supabase
    .from('product_collections')
    .select('product_id')
    .eq('collection_id', collectionId)
    .order('display_order', { ascending: true });

  if (pcError || !pcData || pcData.length === 0) {
    return { data: [], error: pcError };
  }

  const productIds = pcData.map(pc => pc.product_id);

  const { data: products, error: prodError } = await this.supabase
    .from('products')
    .select(`
      *,
      product_images (
        image_url,
        is_primary
      )
    `)
    .in('product_id', productIds)
    .eq('status', 'active');

  return { data: products || [], error: prodError };
}

// Đếm sản phẩm trong mỗi collection
async getDesignCollectionProductCounts() {
  const { data: collections, error: colError } = await this.supabase
    .from('design_collections')
    .select('collection_id, collection_name, collection_slug')
    .eq('is_active', true);

  if (colError) return { data: null, error: colError };

  const counts: Record<string, number> = {};
  
  for (const col of collections || []) {
    const { data: pcData } = await this.supabase
      .from('product_collections')
      .select('product_id', { count: 'exact' })
      .eq('collection_id', col.collection_id);
    
    counts[col.collection_slug] = pcData?.length || 0;
  }

  return { data: counts, error: null };
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

  // Soft delete - đổi is_active thành false thay vì xóa hẳn
  // Vì danh mục có thể đã có sản phẩm
  async deleteCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from('categories')
      .update({ is_active: false })
      .eq('category_id', categoryId)
      .select();
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
    // ============ SHOPPING CART ============
  // async createProduct(productData: any) {
  //   const { data, error } = await this.supabase
  //     .from('products')
  //     .insert([productData])
  //     .select();
  //   return { data, error };
  // }
  // CREATE: thêm sản phẩm vào giỏ
  // async createShoppingCart(cartData: any) {
  //   const { data, error } = await this.supabase
  //     .from('shopping_carts')
  //     .insert([cartData])
  //     .select();
  //     // .single();

  //   return { data, error };
  // }

  // // READ: lấy giỏ hàng theo customer
  // // async getShoppingCart(customerId: number) {
  // //   const { data, error } = await this.supabase
  // //     .from('shopping_carts')
  // //     .select('*')
  // //     .eq('customer_id', customerId)
  // //     .order('created_at', { ascending: false });

  // //   return { data, error };
  // // }

  // // UPDATE: cập nhật số lượng
  // async updateShoppingCart(
  //   cartId: number,
  //   quantity: number,
  // ) {
  //   const { data, error } = await this.supabase
  //     .from('shopping_carts')
  //     .update({
  //       quantity,
  //       updated_at: new Date().toISOString(),
  //     })
  //     .eq('cart_id', cartId)
  //     .select()
  //     .single();

  //   return { data, error };
  // }

  // // DELETE: xóa sản phẩm khỏi giỏ
  // async deleteShoppingCart(cartId: number) {
  //   const { data, error } = await this.supabase
  //     .from('shopping_carts')
  //     .delete()
  //     .eq('cart_id', cartId);

  //   return { data, error };
  // }
  // async getCartItemByUserAndProduct(
  //   userId: string,
  //   productId: number,
  // ) {
  //   const { data, error } = await this.supabase
  //     .from('shopping_carts')
  //     .select('*')
  //     .eq('customer_id', userId)
  //     .eq('product_id', productId)
  //     .single();

  //   return { data, error };
  // }
  // async getCartItemById(cartId: string) {
  //   const { data, error } = await this.supabase
  //     .from('shopping_carts')
  //     .select('*')
  //     .eq('cart_id', cartId)
  //     .single();

  //   return { data, error };
  // }
  // async getShoppingCart(customerId: string) {
  //   const { data, error } = await this.supabase
  //     .from('shopping_carts')
  //     .select('*')
  //     .eq('customer_id', customerId)
  //     .order('created_at', { ascending: false });

  //   return { data, error };
  // }
  // ============ SHOPPING CART (CẬP NHẬT) ============

/**
 * Lấy giỏ hàng theo user_id (UUID) - JOIN với products và product_images
 */
async getShoppingCartByUserId(userId: string) {
  const { data, error } = await this.supabase
    .from('shopping_carts')
    .select(`
      cart_id,
      customer_id,
      product_id,
      variant_id,
      quantity,
      created_at,
      updated_at,
      products (
        product_id,
        product_name,
        price,
        sale_price,
        status,
        product_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Kiểm tra sản phẩm đã có trong giỏ chưa (có thể check theo phone_model_id)
 */
async getCartItemByUserAndProduct(userId: string, productId: number, phoneModelId?: number) {
  let query = this.supabase
    .from('shopping_carts')
    .select('*')
    .eq('customer_id', userId)
    .eq('product_id', productId);
    
  // Nếu có phoneModelId, check cả phone model
  if (phoneModelId) {
    query = query.eq('phone_model_id', phoneModelId);
  } else {
    query = query.is('phone_model_id', null);
  }

  const { data, error } = await query.maybeSingle();  // Dùng maybeSingle thay vì single để tránh lỗi khi không có data

  return { data, error };
}

/**
 * Thêm sản phẩm vào giỏ
 */
/**
 * Map từ users.id (UUID) sang customers.customer_id (INTEGER)
 * Vì 2 bảng liên kết qua email
 */
async createShoppingCartItem(cartData: {
  customer_id: string;  // UUID từ users.id
  product_id: number;
  variant_id?: number | null;
  phone_model_id?: number | null;
  phone_model_name?: string | null;
  quantity: number;
}) {
  const { data, error } = await this.supabase
    .from('shopping_carts')
    .insert([{
      customer_id: cartData.customer_id,  // ✅ UUID trực tiếp, không cần map
      product_id: cartData.product_id,
      variant_id: cartData.variant_id || null,
      phone_model_id: cartData.phone_model_id || null,
      phone_model_name: cartData.phone_model_name || null,
      quantity: cartData.quantity,
    }])
    .select(`*`)
    .single();

  return { data, error };
}

/**
 * Cập nhật số lượng
 */
async updateShoppingCartQuantity(cartId: number, quantity: number) {
  const { data, error } = await this.supabase
    .from('shopping_carts')
    .update({
      quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('cart_id', cartId)
    .select(`
      cart_id,
      customer_id,
      product_id,
      quantity,
      products (
        product_id,
        product_name,
        price,
        sale_price
      )
    `)
    .single();

  return { data, error };
}

/**
 * Xóa item khỏi giỏ
 */
async deleteShoppingCartItem(cartId: number) {
  const { data, error } = await this.supabase
    .from('shopping_carts')
    .delete()
    .eq('cart_id', cartId);

  return { data, error };
}

/**
 * Xóa toàn bộ giỏ hàng của user
 */
async clearShoppingCart(userId: string) {
  const { data, error } = await this.supabase
    .from('shopping_carts')
    .delete()
    .eq('customer_id', userId);

  return { data, error };
}

/**
 * Lấy cart item theo ID (để verify ownership)
 */
async getCartItemById(cartId: number) {
  const { data, error } = await this.supabase
    .from('shopping_carts')
    .select('*')
    .eq('cart_id', cartId)
    .single();

  return { data, error };
}

// ============ WISHLIST ============

/**
 * Lấy danh sách yêu thích của user (dùng user_id UUID)
 */
async getWishlistByUserId(userId: string) {
  const { data, error } = await this.supabase
    .from('wishlists')
    .select(`
      wishlist_id,
      product_id,
      created_at,
      products (
        product_id,
        product_name,
        price,
        sale_price,
        image_url,
        description
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Lấy danh sách product_id trong wishlist của user
 */
async getWishlistProductIds(userId: string) {
  const { data, error } = await this.supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', userId);

  return { data, error };
}

/**
 * Thêm sản phẩm vào wishlist (user_id dạng UUID)
 */
async addProductToWishlist(userId: string, productId: number) {
  const { data, error } = await this.supabase
    .from('wishlists')
    .insert({
      user_id: userId,
      product_id: productId,
    })
    .select()
    .single();

  return { data, error };
}

/**
 * Xóa sản phẩm khỏi wishlist (user_id dạng UUID)
 */
async removeProductFromWishlist(userId: string, productId: number) {
  const { data, error } = await this.supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  return { data, error };
}

/**
 * Kiểm tra sản phẩm có trong wishlist không
 */
async getWishlistItem(userId: string, productId: number) {
  const { data, error } = await this.supabase
    .from('wishlists')
    .select('wishlist_id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  return { data, error };
}

// ============ GIFTS ============

/**
 * Tạo quà tặng mới
 */
async createGift(giftData: {
  sender_id?: string;
  sender_name: string;
  sender_email: string;
  sender_message?: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone?: string;
  recipient_address?: string;
  product_id: number;
  quantity: number;
  verification_code: string;
}) {
  const { data, error } = await this.supabase
    .from('gifts')
    .insert(giftData)
    .select()
    .single();
  return { data, error };
}

/**
 * Lấy thông tin quà tặng theo ID
 */
async getGiftById(giftId: string) {
  const { data, error } = await this.supabase
    .from('gifts')
    .select(`
      *,
      products (
        product_id,
        product_name,
        price,
        sale_price,
        image_url,
        product_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq('gift_id', giftId)
    .single();
  return { data, error };
}

/**
 * Lấy thông tin quà tặng công khai (không có verification_code)
 */
async getGiftPublicInfo(giftId: string) {
  const { data, error } = await this.supabase
    .from('gifts')
    .select(`
      gift_id,
      sender_name,
      sender_message,
      recipient_name,
      recipient_email,
      status,
      created_at,
      expires_at,
      products (
        product_id,
        product_name,
        price,
        sale_price,
        image_url,
        product_images (
          image_url,
          is_primary
        )
      )
    `)
    .eq('gift_id', giftId)
    .single();
  return { data, error };
}

/**
 * Cập nhật trạng thái quà tặng
 */
async updateGiftStatus(giftId: string, status: string, extraData?: any) {
  const updateData: any = { status, ...extraData };
  
  if (status === 'verified') {
    updateData.verified_at = new Date().toISOString();
  } else if (status === 'claimed') {
    updateData.claimed_at = new Date().toISOString();
  }

  const { data, error } = await this.supabase
    .from('gifts')
    .update(updateData)
    .eq('gift_id', giftId)
    .select()
    .single();
  return { data, error };
}

/**
 * Lưu lịch sử email quà tặng
 */
async createGiftEmail(emailData: {
  gift_id: string;
  email_type: string;
  sent_to: string;
  status?: string;
}) {
  const { data, error } = await this.supabase
    .from('gift_emails')
    .insert(emailData)
    .select()
    .single();
  return { data, error };
}

/**
 * Lấy danh sách quà đã gửi theo user
 */
async getSentGifts(userId: string) {
  const { data, error } = await this.supabase
    .from('gifts')
    .select(`
      *,
      products (
        product_name,
        price,
        sale_price,
        image_url,
        product_images (image_url, is_primary)
      )
    `)
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

/**
 * Lấy danh sách quà đã nhận theo email
 */
async getReceivedGifts(email: string) {
  const { data, error } = await this.supabase
    .from('gifts')
    .select(`
      *,
      products (
        product_name,
        price,
        sale_price,
        image_url,
        product_images (image_url, is_primary)
      )
    `)
    .eq('recipient_email', email)
    .order('created_at', { ascending: false });
  return { data, error };
}

// ============ PHONE TEMPLATES ============

/**
 * Lấy danh sách phone templates
 */
async getPhoneTemplates() {
  const { data, error } = await this.supabase
    .from('phone_templates')
    .select('*')
    .eq('is_active', true)
    .order('brand', { ascending: true });
  return { data, error };
}

/**
 * Lấy phone template theo ID
 */
async getPhoneTemplateById(templateId: number) {
  const { data, error } = await this.supabase
    .from('phone_templates')
    .select('*')
    .eq('template_id', templateId)
    .single();
  return { data, error };
}

/**
 * Tạo phone template mới
 */
async createPhoneTemplate(templateData: any) {
  const { data, error } = await this.supabase
    .from('phone_templates')
    .insert(templateData)
    .select()
    .single();
  return { data, error };
}

/**
 * Cập nhật phone template
 */
async updatePhoneTemplate(templateId: number, templateData: any) {
  const { data, error } = await this.supabase
    .from('phone_templates')
    .update(templateData)
    .eq('template_id', templateId)
    .select()
    .single();
  return { data, error };
}

/**
 * Xóa phone template
 */
async deletePhoneTemplate(templateId: number) {
  const { error } = await this.supabase
    .from('phone_templates')
    .delete()
    .eq('template_id', templateId);
  return { error };
}

// ============ CUSTOM DESIGNS ============

/**
 * Tạo thiết kế mới
 */
async createDesign(designData: any) {
  const { data, error } = await this.supabase
    .from('custom_designs')
    .insert(designData)
    .select()
    .single();
  return { data, error };
}

/**
 * Lấy thiết kế theo ID
 */
async getDesignById(designId: number) {
  const { data, error } = await this.supabase
    .from('custom_designs')
    .select(`
      *,
      phone_templates (
        phone_model,
        brand,
        template_image_url
      )
    `)
    .eq('design_id', designId)
    .single();
  return { data, error };
}

/**
 * Cập nhật thiết kế
 */
async updateDesign(designId: number, updateData: any) {
  const { data, error } = await this.supabase
    .from('custom_designs')
    .update(updateData)
    .eq('design_id', designId)
    .select()
    .single();
  return { data, error };
}

/**
 * Lấy danh sách thiết kế của user
 */
async getUserDesigns(userId: string) {
  const { data, error } = await this.supabase
    .from('custom_designs')
    .select(`
      *,
      phone_templates (
        phone_model,
        brand,
        template_image_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
}

/**
 * Lấy tất cả thiết kế (admin)
 */
async getAllDesigns(status?: string) {
  let query = this.supabase
    .from('custom_designs')
    .select(`
      *,
      phone_templates (
        phone_model,
        brand,
        template_image_url
      ),
      users (
        full_name,
        email,
        phone
      )
    `)
    .order('submitted_at', { ascending: false, nullsFirst: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Xóa thiết kế
 */
async deleteDesign(designId: number) {
  const { error } = await this.supabase
    .from('custom_designs')
    .delete()
    .eq('design_id', designId);
  return { error };
}

/**
 * Lưu ảnh thiết kế
 */
async createDesignImage(imageData: any) {
  const { data, error } = await this.supabase
    .from('design_images')
    .insert(imageData)
    .select()
    .single();
  return { data, error };
}

/**
 * Lấy danh sách ảnh của thiết kế
 */
async getDesignImages(designId: number) {
  const { data, error } = await this.supabase
    .from('design_images')
    .select('*')
    .eq('design_id', designId)
    .order('created_at', { ascending: true });
  return { data, error };
}

}
