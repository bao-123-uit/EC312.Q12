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