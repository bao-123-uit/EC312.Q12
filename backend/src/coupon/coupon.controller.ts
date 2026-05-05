import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post('validate')
  async validateCoupon(@Body() body: { code?: string; subtotal?: number; shipping_fee?: number }) {
    return await this.couponService.validateCoupon(body);
  }

  @Get('admin/all')
  async getAllCoupons() {
    return await this.couponService.getAllCoupons();
  }

  @Post('admin')
  async createCoupon(@Body() body: Record<string, any>) {
    return await this.couponService.createCoupon(body);
  }

  @Put('admin/:couponId')
  async updateCoupon(
    @Param('couponId', ParseIntPipe) couponId: number,
    @Body() body: Record<string, any>,
  ) {
    return await this.couponService.updateCoupon(couponId, body);
  }

  @Delete('admin/:couponId')
  async deleteCoupon(@Param('couponId', ParseIntPipe) couponId: number) {
    return await this.couponService.deleteCoupon(couponId);
  }
}
