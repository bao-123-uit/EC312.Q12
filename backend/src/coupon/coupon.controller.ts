import { Body, Controller, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('validate')
  async validateCoupon(@Body() body: { code?: string; subtotal?: number; shipping_fee?: number }) {
    return await this.couponService.validateCoupon(body);
  }
}
