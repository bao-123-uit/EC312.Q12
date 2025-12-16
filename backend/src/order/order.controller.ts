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
