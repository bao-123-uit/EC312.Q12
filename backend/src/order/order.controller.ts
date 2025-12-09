import { Controller, Get, Query, Param } from '@nestjs/common';
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
}
