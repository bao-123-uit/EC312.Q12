import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GiftService } from './gift.service';

// DTOs
class SendGiftDto {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientAddress?: string;
  productId: number;
  quantity?: number;
}

class CreateGiftPaymentDto {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  productId: number;
  quantity?: number;
}

class VerifyGiftPaymentDto {
  giftId: string;
  orderCode: string;
}

class VerifyGiftDto {
  giftId: string;
  verificationCode: string;
}

class ClaimGiftDto {
  giftId: string;
  recipientAddress: string;
  recipientPhone: string;
}

@Controller('gift')
export class GiftController {
  constructor(private readonly giftService: GiftService) {}

  // POST /gift/create-payment - Tạo thanh toán PayOS cho quà tặng
  @Post('create-payment')
  @HttpCode(HttpStatus.CREATED)
  async createGiftPayment(@Body() dto: CreateGiftPaymentDto) {
    return this.giftService.createGiftPayment(dto);
  }

  // POST /gift/verify-payment - Xác minh thanh toán và gửi email
  @Post('verify-payment')
  @HttpCode(HttpStatus.OK)
  async verifyGiftPayment(@Body() dto: VerifyGiftPaymentDto) {
    return this.giftService.verifyGiftPayment(dto.giftId, dto.orderCode);
  }

  // POST /gift/send - Gửi quà tặng (cũ - không cần thanh toán)
  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  async sendGift(@Body() dto: SendGiftDto) {
    return this.giftService.sendGift(dto);
  }

  // POST /gift/verify - Xác nhận mã
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyGift(@Body() dto: VerifyGiftDto) {
    return this.giftService.verifyGift(dto);
  }

  // POST /gift/claim - Nhận quà
  @Post('claim')
  @HttpCode(HttpStatus.OK)
  async claimGift(@Body() dto: ClaimGiftDto) {
    return this.giftService.claimGift(dto);
  }

  // GET /gift/:giftId - Lấy thông tin quà (public)
  @Get(':giftId')
  async getGiftInfo(@Param('giftId') giftId: string) {
    return this.giftService.getGiftInfo(giftId);
  }

  // GET /gift/sent/:userId - Lấy quà đã gửi
  @Get('sent/:userId')
  async getSentGifts(@Param('userId') userId: string) {
    return this.giftService.getSentGifts(userId);
  }

  // GET /gift/received?email=xxx - Lấy quà đã nhận
  @Get('received/by-email')
  async getReceivedGifts(@Query('email') email: string) {
    return this.giftService.getReceivedGifts(email);
  }
}
