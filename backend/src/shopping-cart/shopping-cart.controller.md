// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Body,
//   Param,
// } from '@nestjs/common';
// import { ShoppingCartService } from './shopping-cart.service';

// @Controller('shopping-cart')
// export class ShoppingCartController {
//   constructor(
//     private readonly shoppingCartService: ShoppingCartService,
//   ) {}
//     // ================= ADD TO CART =================
//   // POST /shopping-cart
//   @Post()
//   createShoppingCart(
//     @Body()
//     body: {
//       customer_id: number;
//       product_id: number;
//       variant_id?: number | null;
//       quantity: number;
//     },
//   ) {
//     return this.shoppingCartService.createShoppingCart(body);
//   }
//   // ================= GET CART BY CUSTOMER =================
//   // GET /shopping-cart/customer/10
//   @Get('customer/:customerId')
//   getShoppingCart(
//     @Param('customerId') customerId: string,
//   ) {
//     // console.log(customerId);
//     return this.shoppingCartService.getShoppingCart(
//       Number(customerId),
//     );
//   }



//   // ================= UPDATE CART ITEM =================
//   // PUT /shopping-cart/5
//   @Put(':cartId')
//   updateShoppingCart(
//     @Param('cartId') cartId: string,
//     @Body()
//     body: {
//       quantity: number;
//     },
//   ) {
//     return this.shoppingCartService.updateShoppingCart(
//       Number(cartId),
//       body.quantity,
//     );
//   }

//   // ================= DELETE CART ITEM =================
//   // DELETE /shopping-cart/5
//   @Delete(':cartId')
//   deleteShoppingCart(
//     @Param('cartId') cartId: string,
//   ) {
//     return this.shoppingCartService.deleteShoppingCart(
//       Number(cartId),
//     );
//   }
// }





























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

