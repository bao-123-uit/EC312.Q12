/**
 * Messenger Controller
 * API endpoints cho Facebook Messenger Webhook và quản lý đơn hàng
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { OrderStatus } from './messenger.types';
import { FacebookWebhookPayloadDto } from './messenger.dto';

@Controller('messenger')
export class MessengerController {
  private readonly logger = new Logger(MessengerController.name);

  constructor(private readonly messengerService: MessengerService) {}

  /**
   * GET /messenger/webhook
   * Xác minh webhook từ Facebook
   * Facebook sẽ gọi endpoint này khi cấu hình webhook
   */
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    this.logger.log(`Nhận yêu cầu xác minh webhook - Mode: ${mode}`);

    if (!mode || !token) {
      this.logger.warn('Thiếu mode hoặc token');
      throw new BadRequestException('Missing mode or token');
    }

    const result = this.messengerService.verifyWebhook(mode, token, challenge);

    if (result) {
      this.logger.log('Xác minh webhook thành công');
      return result;
    }

    this.logger.warn('Xác minh webhook thất bại - Token không khớp');
    throw new BadRequestException('Verification failed');
  }

  /**
   * POST /messenger/webhook
   * Nhận sự kiện từ Facebook Messenger
   * Tất cả tin nhắn, postback sẽ được gửi đến đây
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: FacebookWebhookPayloadDto): Promise<string> {
    this.logger.log(`Nhận webhook event: ${JSON.stringify(payload).substring(0, 200)}...`);

    // Phản hồi ngay trong 5 giây theo yêu cầu của Facebook
    // Xử lý async để không block
    setImmediate(async () => {
      try {
        await this.messengerService.handleWebhook(payload as any);
      } catch (error) {
        this.logger.error(`Lỗi xử lý webhook: ${error.message}`, error.stack);
      }
    });

    // Trả về ngay để Facebook không timeout
    return 'EVENT_RECEIVED';
  }

  // ==================== API QUẢN LÝ ĐƠN HÀNG ====================

  /**
   * GET /messenger/products
   * Lấy danh sách sản phẩm
   */
  @Get('products')
  async getProducts() {
    this.logger.log('Lấy danh sách sản phẩm');
    const products = await this.messengerService.getProductList();
    return {
      success: true,
      data: products,
    };
  }

  /**
   * GET /messenger/phone-models
   * Lấy danh sách dòng máy điện thoại cho bot
   */
  @Get('phone-models')
  async getPhoneModels(): Promise<{ success: boolean; data: any[] }> {
    this.logger.log('Lấy danh sách phone models cho bot');
    const models = await this.messengerService.getPhoneModelList();
    return {
      success: true,
      data: models,
    };
  }

  /**
   * GET /messenger/orders
   * Lấy danh sách tất cả đơn hàng (admin)
   */
  @Get('orders')
  async getAllOrders(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    this.logger.log(`Lấy danh sách đơn hàng - Limit: ${limit}, Offset: ${offset}`);
    
    const result = await this.messengerService.getAllOrders(
      parseInt(limit || '50', 10),
      parseInt(offset || '0', 10),
    );

    return {
      success: true,
      data: result.orders,
      total: result.total,
    };
  }

  /**
   * GET /messenger/orders/:id
   * Lấy chi tiết đơn hàng theo ID
   */
  @Get('orders/:id')
  async getOrderById(@Param('id') id: string) {
    this.logger.log(`Lấy đơn hàng: ${id}`);

    const order = await this.messengerService.getOrderById(id);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return {
      success: true,
      data: order,
    };
  }

  /**
   * PUT /messenger/orders/:id/status
   * Cập nhật trạng thái đơn hàng
   */
  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    this.logger.log(`Cập nhật trạng thái đơn ${id}: ${status}`);

    // Validate status
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Trạng thái không hợp lệ. Chấp nhận: ${validStatuses.join(', ')}`);
    }

    try {
      const updatedOrder = await this.messengerService.updateOrderStatus(id, status);
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: updatedOrder,
      };
    } catch (error) {
      this.logger.error(`Lỗi cập nhật trạng thái: ${error.message}`);
      throw new BadRequestException('Không thể cập nhật trạng thái đơn hàng');
    }
  }

  /**
   * POST /messenger/orders/webhook
   * Nhận đơn hàng từ webhook (endpoint cho hệ thống quản lý)
   */
  @Post('orders/webhook')
  @HttpCode(HttpStatus.OK)
  async receiveOrderWebhook(@Body() orderData: any) {
    this.logger.log(`Nhận webhook đơn hàng: ${JSON.stringify(orderData)}`);

    // Validate dữ liệu cơ bản
    if (!orderData.customer_name || !orderData.phone || !orderData.product) {
      throw new BadRequestException('Thiếu thông tin bắt buộc: customer_name, phone, product');
    }

    return {
      success: true,
      message: 'Đã nhận đơn hàng',
      received_at: new Date().toISOString(),
    };
  }

  /**
   * GET /messenger/health
   * Kiểm tra trạng thái service
   */
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'messenger-bot',
      timestamp: new Date().toISOString(),
    };
  }
}
