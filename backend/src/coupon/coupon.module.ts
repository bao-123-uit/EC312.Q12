import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [CouponController],
  providers: [CouponService, SupabaseService],
})
export class CouponModule {}
