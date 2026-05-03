import { getSupabaseClient } from './base.repository';

/**
 * Shopping Cart Repository - Quản lý giỏ hàng
 */
export class ShoppingCartRepository {
  private get supabase() { return getSupabaseClient(); }

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
   * Kiểm tra sản phẩm đã có trong giỏ chưa
   */
  async getCartItemByUserAndProduct(userId: string, productId: number, phoneModelId?: number) {
    let query = this.supabase
      .from('shopping_carts')
      .select('*')
      .eq('customer_id', userId)
      .eq('product_id', productId);
      
    if (phoneModelId) {
      query = query.eq('phone_model_id', phoneModelId);
    } else {
      query = query.is('phone_model_id', null);
    }

    const { data, error } = await query.maybeSingle();
    return { data, error };
  }

  /**
   * Thêm sản phẩm vào giỏ
   */
  async createShoppingCartItem(cartData: {
    customer_id: string;
    product_id: number;
    phone_model_id?: number | null;
    phone_model_name?: string | null;
    quantity: number;
  }) {
    const { data, error } = await this.supabase
      .from('shopping_carts')
      .insert([{
        customer_id: cartData.customer_id,
        product_id: cartData.product_id,
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
}

// Export singleton instance
export const shoppingCartRepository = new ShoppingCartRepository();
