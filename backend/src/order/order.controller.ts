import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard, RolesGuard, CustomerGuard } from '../auth/guards';
import { Roles, CurrentUser, CustomerOnly } from '../auth/decorators';
import { UserRole } from '../common';
import type { AuthenticatedUser } from '../common';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * POST /orders - Tạo đơn hàng mới
   * Yêu cầu: CUSTOMER only (phải đăng nhập)
   */
  @Post()
  @CustomerOnly()
  async createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: {
      items: {
    product_id: number;
    variant_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }[];

  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    ward?: string;
    district?: string;
    city: string;
  };

  subtotal: number;
  discount_amount?: number;
  shipping_fee?: number;
  tax_amount?: number;
  total_amount: number;

  payment_method?: string;
  coupon_code?: string;
  customer_note?: string;
    },
  ) {
    if (!body.items || body.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    return this.orderService.createOrder(user.id, body);
  }

  /**
   * GET /orders - Lấy danh sách orders
   * - Admin: xem tất cả
   * - Customer: chỉ xem của mình
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getOrders(@CurrentUser() user: AuthenticatedUser) {
    if (user.role === UserRole.ADMIN) {
      return this.orderService.getAllOrders();
    }
    return this.orderService.getOrdersByUserId(user.id);
  }

  /**
   * GET /orders/number/:orderNumber - Lấy order theo mã đơn hàng
   * Dùng cho trang order success và order detail
   */
  @Get('number/:orderNumber')
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.orderService.getOrderByNumber(orderNumber);
  }

  /**
   * GET /orders/:id - Xem chi tiết đơn hàng theo ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') orderId: string,
  ) {
    const order = await this.orderService.getOrderById(orderId);

    // Customer chỉ xem được order của mình
    if (user.role === UserRole.CUSTOMER && order.customer_id !== user.id) {
      throw new BadRequestException('Không có quyền xem đơn hàng này');
    }

    return order;
  }

  /**
   * PUT /orders/:id/status - Cập nhật trạng thái (ADMIN only)
   */
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body('status') status: string,
  ) {
    return this.orderService.updateOrderStatus(orderId, status);
  }

  /**
   * PUT /orders/:id/payment - Cập nhật trạng thái thanh toán
   */
  @Put(':id/payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updatePaymentStatus(
    @Param('id') orderId: string,
    @Body('payment_status') paymentStatus: string,
  ) {
    return this.orderService.updatePaymentStatus(orderId, paymentStatus);
  }

  /**
   * GET /orders/admin/all - Xem tất cả orders (ADMIN only)
   * Tạm thời bỏ guard để test
   */
  @Get('admin/all')
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
}