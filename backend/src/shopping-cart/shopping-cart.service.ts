// backend/src/shopping-cart/shopping-cart.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class ShoppingCartService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Lấy giỏ hàng theo userId (UUID)
   */
  private async getCustomerIdFromUserId(userId: string): Promise<number | null> {
    // Cách 1: Nếu bảng users có cột customer_id
    const { data: user, error } = await this.supabaseService.getCustomerById(userId);
    
    if (error || !user) {
      return null;
    }
    
    // Nếu user.customer_id tồn tại (liên kết với bảng customers)
    if (user.customer_id) {
      return user.customer_id;
    }
    
    // Cách 2: Nếu bảng customers dùng email để map
    const { data: customer } = await this.supabaseService.getCustomerByEmail(user.email);
    return customer?.customer_id || null;
  }

  async getCartByUserId(userId: string) {
    const { data, error } =
      await this.supabaseService.getShoppingCart(userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      data: data || [],
    };
  }

  /**
   * Thêm sản phẩm vào giỏ
   * - Nếu đã tồn tại → cộng quantity
   * - Nếu chưa → insert mới
   */
  async addToCart(
    userId: string,
    productId: number,
    quantity: number,
  ) {
    const customerId = await this.getCustomerIdFromUserId(userId);
    // 1️⃣ Kiểm tra item đã tồn tại chưa
    const existing =
      await this.supabaseService.getCartItemByUserAndProduct(
        userId,
        productId,
      );

    if (existing.error) {
      return { success: false, message: existing.error.message };
    }

    // 2️⃣ Nếu tồn tại → update quantity
    if (existing.data) {
      const updated =
        await this.supabaseService.updateShoppingCart(
          existing.data.cart_id,
          existing.data.quantity + quantity,
        );

      if (updated.error) {
        return { success: false, message: updated.error.message };
      }

      return {
        success: true,
        action: 'updated',
        data: updated.data,
      };
    }

    // 3️⃣ Nếu chưa tồn tại → insert
    const created =
      await this.supabaseService.createShoppingCart({
        customer_id: customerId,
        product_id: productId,
        quantity,
      });

    if (created.error) {
      return { success: false, message: created.error.message };
    }

    return {
      success: true,
      action: 'created',
      data: created.data,
    };
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   * (chỉ owner mới được sửa)
   */
  async updateQuantity(
    userId: string,
    cartId: string,
    quantity: number,
  ) {
    // 1️⃣ Check cart item có thuộc user không
    const cart =
      await this.supabaseService.getCartItemById(cartId);

    if (!cart.data || cart.data.customer_id !== userId) {
      throw new ForbiddenException('Không có quyền thao tác giỏ hàng này');
    }

    // 2️⃣ Update
    const result =
      await this.supabaseService.updateShoppingCart(
        Number(cartId),
        quantity,
      );

    if (result.error) {
      return { success: false, message: result.error.message };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  /**
   * Xóa sản phẩm khỏi giỏ
   * (chỉ owner)
   */
  async removeFromCart(
    userId: string,
    cartId: string,
  ) {
    const cart =
      await this.supabaseService.getCartItemById(cartId);

    if (!cart.data || cart.data.customer_id !== userId) {
      throw new ForbiddenException('Không có quyền xóa item này');
    }

    const result =
      await this.supabaseService.deleteShoppingCart(Number(cartId));

    if (result.error) {
      return { success: false, message: result.error.message };
    }

    return {
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    };
  }
}
