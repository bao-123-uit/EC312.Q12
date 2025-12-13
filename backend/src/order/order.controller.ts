import { Controller, Get, Query, Param, Post, Body, Put } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getOrders(@Query('limit') limit: string = '20') {
    return await this.orderService.getOrders(parseInt(limit));
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return await this.orderService.getOrderById(parseInt(id));
  }
  // Lấy đơn hàng theo khách hàng
  @Get('customer/:customerId')
  async getOrdersByCustomer(@Param('customerId') customerId: string) {
    return await this.orderService.getOrdersByCustomer(parseInt(customerId));
  }

  // Tạo đơn hàng mới
  @Post()
  async createOrder(@Body() body: any) {
    // body cần có: customer_id, address, products, note
    return await this.orderService.createOrder(body);
  }

  // Cập nhật trạng thái đơn hàng
  @Put(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body('order_status') order_status: string) {
    return await this.orderService.updateOrderStatus(parseInt(id), order_status);
  }

  // Cập nhật trạng thái thanh toán
  @Put(':id/payment-status')
  async updatePaymentStatus(@Param('id') id: string, @Body('payment_status') payment_status: string) {
    return await this.orderService.updatePaymentStatus(parseInt(id), payment_status);
  }
}
