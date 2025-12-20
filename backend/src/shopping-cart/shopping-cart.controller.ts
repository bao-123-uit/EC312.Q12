import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { CurrentUser, CustomerOnly } from '../auth/decorators';

// DTOs
class AddToCartDto {
  productId: number;
  quantity?: number;
  variantId?: number;
  phoneModelId?: number;
  phoneModelName?: string;
}

class UpdateQuantityDto {
  quantity: number;
}

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly cartService: ShoppingCartService) {}

  /**
   * GET /shopping-cart - Lấy giỏ hàng của user hiện tại
   * Yêu cầu: Đăng nhập với role CUSTOMER
   */
  @Get()
  @CustomerOnly()
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCartByUserId(userId);
  }

  /**
   * POST /shopping-cart - Thêm sản phẩm vào giỏ
   * Body: { productId: number, quantity?: number, variantId?: number }
   */
  @Post()
  @CustomerOnly()
  @HttpCode(HttpStatus.CREATED)
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body() body: AddToCartDto,
  ) {
    return this.cartService.addToCart(
      userId,
      body.productId,
      body.quantity || 1,
      body.variantId,
      body.phoneModelId,
      body.phoneModelName,
    );
  }

  /**
   * PUT /shopping-cart/:id - Cập nhật số lượng
   * Params: id = cart_id
   * Body: { quantity: number }
   */
  @Put(':id')
  @CustomerOnly()
  async updateQuantity(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) cartId: number,
    @Body() body: UpdateQuantityDto,
  ) {
    return this.cartService.updateQuantity(userId, cartId, body.quantity);
  }

  /**
   * DELETE /shopping-cart/:id - Xóa item khỏi giỏ
   */
  @Delete(':id')
  @CustomerOnly()
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) cartId: number,
  ) {
    return this.cartService.removeFromCart(userId, cartId);
  }

  /**
   * DELETE /shopping-cart - Xóa toàn bộ giỏ hàng
   */
  @Delete()
  @CustomerOnly()
  async clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
