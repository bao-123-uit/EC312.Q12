// import { Controller, Get, Query, Param, Post, Body, Put } from '@nestjs/common';
// import { OrderService } from './order.service';

// @Controller('orders')
// export class OrderController {
//   constructor(private readonly orderService: OrderService) {}

//   @Get()
//   async getOrders(@Query('limit') limit: string = '20') {
//     return await this.orderService.getOrders(parseInt(limit));
//   }

//   @Get(':id')
//   async getOrderById(@Param('id') id: string) {
//     return await this.orderService.getOrderById(parseInt(id));
//   }
//   // Lấy đơn hàng theo khách hàng
//   @Get('customer/:customerId')
//   async getOrdersByCustomer(@Param('customerId') customerId: string) {
//     return await this.orderService.getOrdersByCustomer(parseInt(customerId));
//   }

//   // Tạo đơn hàng mới
//   @Post()
//   async createOrder(@Body() body: any) {
//     // body cần có: customer_id, address, products, note
//     return await this.orderService.createOrder(body);
//   }

//   // Cập nhật trạng thái đơn hàng
//   @Put(':id/status')
//   async updateOrderStatus(@Param('id') id: string, @Body('order_status') order_status: string) {
//     return await this.orderService.updateOrderStatus(parseInt(id), order_status);
//   }

//   // Cập nhật trạng thái thanh toán
//   @Put(':id/payment-status')
//   async updatePaymentStatus(@Param('id') id: string, @Body('payment_status') payment_status: string) {
//     return await this.orderService.updatePaymentStatus(parseInt(id), payment_status);
//   }
// }
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard, RolesGuard, CustomerGuard } from '../auth/guards';
import { Roles, CurrentUser, CustomerOnly } from '../auth/decorators';
import {UserRole } from '../common';
import type { AuthenticatedUser } from '../common';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * POST /orders - Tạo đơn hàng mới
   * Yêu cầu: CUSTOMER only
   */
  @Post()
  @CustomerOnly()
  async createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { items: any[]; shippingAddress: string },
  ) {
    return this.orderService.createOrder(user.id, body.items, body.shippingAddress);
  }

  /**
   * GET /orders - Lấy orders của user hiện tại (customer)
   * Hoặc tất cả orders (admin)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrders(@CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN) {
      // Admin xem tất cả
      return this.orderService.getAllOrders();
    }
    // Customer chỉ xem của mình
    return this.orderService.getOrdersByUserId(user.id);
  }

  /**
   * GET /orders/:id - Xem chi tiết đơn hàng
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') orderId: string,
  ) {
    const order = await this.orderService.getOrderById(orderId);
    
    // Customer chỉ xem được order của mình
    if (user.role === UserRole.CUSTOMER && order.userId !== user.id) {
      throw new Error('Không có quyền xem đơn hàng này');
    }
    
    return order;
  }

  /**
   * GET /orders/admin/all - Xem tất cả orders (ADMIN only)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
}
