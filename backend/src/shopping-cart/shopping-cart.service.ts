import { Injectable, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class ShoppingCartService {
  private readonly logger = new Logger(ShoppingCartService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Lấy giỏ hàng của user (có JOIN products)
   */
  async getCartByUserId(userId: string) {
    this.logger.log(`Getting cart for user: ${userId}`);

    const { data, error } = await this.supabaseService.getShoppingCartByUserId(userId);

    if (error) {
      this.logger.error(`Get cart error: ${error.message}`);
      return { success: false, message: error.message, data: [] };
    }

    // Transform data để frontend dễ sử dụng
    const cartItems = (data || []).map((item: any) => {
      // Lấy ảnh primary hoặc ảnh đầu tiên từ product_images
      const images = item.products?.product_images || [];
      const primaryImage = images.find((img: any) => img.is_primary) || images[0];
      const imageUrl = primaryImage?.image_url || null;

      return {
        cart_id: item.cart_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        phone_model_id: item.phone_model_id,
        phone_model_name: item.phone_model_name,
        quantity: item.quantity,
        created_at: item.created_at,
        // Flatten product info
        product_name: item.products?.product_name || `Sản phẩm #${item.product_id}`,
        price: item.products?.sale_price || item.products?.price || 0,
        original_price: item.products?.price || 0,
        image_url: imageUrl,
        status: item.products?.status || 'active',
      };
    });

    return {
      success: true,
      data: cartItems,
      total: cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
      itemCount: cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
    };
  }

  /**
   * Thêm sản phẩm vào giỏ
   */
  async addToCart(
    userId: string, 
    productId: number, 
    quantity: number = 1, 
    variantId?: number,
    phoneModelId?: number,
    phoneModelName?: string
  ) {
    this.logger.log(`Adding to cart: user=${userId}, product=${productId}, qty=${quantity}, phoneModel=${phoneModelName || phoneModelId}`);

    if (quantity < 1) {
      throw new BadRequestException('Số lượng phải >= 1');
    }

    // 1️⃣ Kiểm tra sản phẩm đã có trong giỏ chưa (cùng phone model)
    const { data: existingItem, error: checkError } = 
      await this.supabaseService.getCartItemByUserAndProduct(userId, productId, phoneModelId);

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, không phải lỗi thực sự
      this.logger.error(`Check existing error: ${checkError.message}`);
      return { success: false, message: checkError.message };
    }

    // 2️⃣ Nếu đã tồn tại → cộng dồn quantity
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const { data: updated, error: updateError } = 
        await this.supabaseService.updateShoppingCartQuantity(existingItem.cart_id, newQuantity);

      if (updateError) {
        this.logger.error(`Update quantity error: ${updateError.message}`);
        return { success: false, message: updateError.message };
      }

      this.logger.log(`Updated existing cart item: ${existingItem.cart_id}, new qty: ${newQuantity}`);

      return {
        success: true,
        action: 'updated',
        message: 'Đã cập nhật số lượng trong giỏ hàng',
        data: updated,
      };
    }

    // 3️⃣ Chưa tồn tại → insert mới
    const { data: created, error: createError } = await this.supabaseService.createShoppingCartItem({
      customer_id: userId,
      product_id: productId,
      variant_id: variantId || null,
      phone_model_id: phoneModelId || null,
      phone_model_name: phoneModelName || null,
      quantity,
    });

    if (createError) {
      this.logger.error(`Create cart item error: ${createError.message}`);
      return { success: false, message: createError.message };
    }

    this.logger.log(`Created new cart item for product: ${productId}`);

    return {
      success: true,
      action: 'created',
      message: 'Đã thêm sản phẩm vào giỏ hàng',
      data: created,
    };
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  async updateQuantity(userId: string, cartId: number, quantity: number) {
    this.logger.log(`Updating quantity: cart=${cartId}, qty=${quantity}`);

    // 1️⃣ Verify ownership
    const { data: cartItem, error: getError } = await this.supabaseService.getCartItemById(cartId);

    if (getError || !cartItem) {
      throw new BadRequestException('Không tìm thấy item trong giỏ hàng');
    }

    if (cartItem.customer_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa giỏ hàng này');
    }

    // 2️⃣ Nếu quantity = 0 → xóa item
    if (quantity <= 0) {
      return this.removeFromCart(userId, cartId);
    }

    // 3️⃣ Update quantity
    const { data, error } = await this.supabaseService.updateShoppingCartQuantity(cartId, quantity);

    if (error) {
      this.logger.error(`Update error: ${error.message}`);
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Đã cập nhật số lượng',
      data,
    };
  }

  /**
   * Xóa sản phẩm khỏi giỏ
   */
  async removeFromCart(userId: string, cartId: number) {
    this.logger.log(`Removing from cart: cart=${cartId}`);

    // 1️⃣ Verify ownership
    const { data: cartItem, error: getError } = await this.supabaseService.getCartItemById(cartId);

    if (getError || !cartItem) {
      throw new BadRequestException('Không tìm thấy item trong giỏ hàng');
    }

    if (cartItem.customer_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa item này');
    }

    // 2️⃣ Delete
    const { error } = await this.supabaseService.deleteShoppingCartItem(cartId);

    if (error) {
      this.logger.error(`Delete error: ${error.message}`);
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
    };
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(userId: string) {
    const { error } = await this.supabaseService.clearShoppingCart(userId);

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng',
    };
  }
}