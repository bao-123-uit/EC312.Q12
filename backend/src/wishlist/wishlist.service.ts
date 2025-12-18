import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class WishlistService {
  constructor(private supabaseService: SupabaseService) {}

  // Lấy danh sách yêu thích của user
  async getWishlist(userId: string) {
    try {
      const { data, error } = await this.supabaseService.getWishlistByUserId(userId);

      if (error) {
        console.error('Get wishlist error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get wishlist error:', error);
      return [];
    }
  }

  // Lấy danh sách product_id trong wishlist của user
  async getWishlistProductIds(userId: string): Promise<number[]> {
    try {
      const { data, error } = await this.supabaseService.getWishlistProductIds(userId);

      if (error) {
        console.error('Get wishlist product ids error:', error);
        return [];
      }

      return data?.map(item => item.product_id) || [];
    } catch (error) {
      console.error('Get wishlist product ids error:', error);
      return [];
    }
  }

  // Thêm sản phẩm vào danh sách yêu thích
  async addToWishlist(userId: string, productId: number) {
    try {
      const { data, error } = await this.supabaseService.addProductToWishlist(userId, productId);

      if (error) {
        // Nếu đã tồn tại thì không báo lỗi
        if (error.code === '23505') {
          return { message: 'Product already in wishlist', success: true };
        }
        console.error('Add to wishlist error:', error);
        throw error;
      }

      return { message: 'Added to wishlist', success: true, data };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      throw error;
    }
  }

  // Xóa sản phẩm khỏi danh sách yêu thích
  async removeFromWishlist(userId: string, productId: number) {
    try {
      const { error } = await this.supabaseService.removeProductFromWishlist(userId, productId);

      if (error) {
        console.error('Remove from wishlist error:', error);
        throw error;
      }

      return { message: 'Removed from wishlist', success: true };
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      throw error;
    }
  }

  // Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
  async toggleWishlist(userId: string, productId: number) {
    try {
      // Kiểm tra xem đã có trong wishlist chưa
      const { data: existing } = await this.supabaseService.getWishlistItem(userId, productId);

      if (existing) {
        // Đã có -> xóa
        await this.removeFromWishlist(userId, productId);
        return { message: 'Removed from wishlist', success: true, action: 'removed' };
      } else {
        // Chưa có -> thêm
        await this.addToWishlist(userId, productId);
        return { message: 'Added to wishlist', success: true, action: 'added' };
      }
    } catch (error) {
      console.error('Toggle wishlist error:', error);
      throw error;
    }
  }

  // Kiểm tra sản phẩm có trong wishlist không
  async isInWishlist(userId: string, productId: number): Promise<boolean> {
    try {
      const { data } = await this.supabaseService.getWishlistItem(userId, productId);
      return !!data;
    } catch (error) {
      return false;
    }
  }
}
