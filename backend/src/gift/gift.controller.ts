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

  // POST /gift/send - Gửi quà tặng
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
