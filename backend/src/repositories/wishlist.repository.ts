import { getSupabaseClient } from './base.repository';

/**
 * Wishlist Repository - Quản lý danh sách yêu thích
 */
export class WishlistRepository {
  private get supabase() { return getSupabaseClient(); }

  // Legacy method (dùng customer_id number)
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

  // New methods (dùng user_id UUID)
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

  async getWishlistProductIds(userId: string) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    return { data, error };
  }

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

  async removeProductFromWishlist(userId: string, productId: number) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    return { data, error };
  }

  async getWishlistItem(userId: string, productId: number) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .select('wishlist_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    return { data, error };
  }
}

// Export singleton instance
export const wishlistRepository = new WishlistRepository();
