import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { JwtAuthGuard, CustomerGuard } from '../auth/guards';
import { CurrentUser, CustomerOnly } from '../auth/decorators';
import { AuthenticatedUser } from '../common';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly cartService: ShoppingCartService) {}

  /**
   * GET /cart - Lấy giỏ hàng của user
   * Yêu cầu: Đăng nhập + Role CUSTOMER
   */
  @Get()
  @CustomerOnly()
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCartByUserId(userId);
  }

  /**
   * POST /cart - Thêm sản phẩm vào giỏ
   * Yêu cầu: Đăng nhập + Role CUSTOMER
   */
  @Post()
  @CustomerOnly()
  async addToCart(
    @CurrentUser('id') userId: string,
    @Body() body: { productId: number; quantity: number },
  ) {
    return this.cartService.addToCart(userId, body.productId, body.quantity);
  }

  /**
   * PUT /cart/:id - Cập nhật số lượng
   * Yêu cầu: Đăng nhập + Role CUSTOMER
   */
  @Put(':id')
  @CustomerOnly()
  async updateQuantity(
    @CurrentUser('id') userId: string,
    @Param('id') cartId: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateQuantity(userId, cartId, body.quantity);
  }

  /**
   * DELETE /cart/:id - Xóa item khỏi giỏ
   * Yêu cầu: Đăng nhập + Role CUSTOMER
   */
  @Delete(':id')
  @CustomerOnly()
  async removeFromCart(
    @CurrentUser('id') userId: string,
    @Param('id') cartId: string,
  ) {
    return this.cartService.removeFromCart(userId, cartId);
  }
}

