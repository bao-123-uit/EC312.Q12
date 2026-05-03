import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class CouponService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async validateCoupon(body: { code?: string; subtotal?: number; shipping_fee?: number }) {
    const code = String(body.code || '').trim();
    const subtotal = Number(body.subtotal || 0);
    const shippingFee = Number(body.shipping_fee || 0);

    if (!code) {
      return { success: false, message: 'Invalid coupon code' };
    }

    const result = await this.supabaseService.getCoupon(code);
    if (result.error || !result.data) {
      return { success: false, message: 'Coupon not found' };
    }

    const coupon = result.data;
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validTo = new Date(coupon.valid_to);

    if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validTo.getTime())) {
      return { success: false, message: 'Invalid coupon dates' };
    }

    if (now < validFrom || now > validTo) {
      return { success: false, message: 'Coupon expired' };
    }

    if (coupon.usage_limit !== null && coupon.usage_limit !== undefined) {
      if (coupon.used_count >= coupon.usage_limit) {
        return { success: false, message: 'Coupon usage limit reached' };
      }
    }

    if (coupon.min_order_amount !== null && coupon.min_order_amount !== undefined) {
      if (subtotal < Number(coupon.min_order_amount)) {
        return { success: false, message: 'Order total is too low' };
      }
    }

    const couponType = String(coupon.coupon_type || '').toLowerCase();
    let discountAmount = 0;
    let nextShippingFee = shippingFee;

    if (couponType.includes('free_shipping') || couponType.includes('freeship')) {
      nextShippingFee = 0;
    } else if (couponType.includes('percent') || couponType.includes('percentage')) {
      discountAmount = subtotal * (Number(coupon.discount_value) / 100);
    } else {
      discountAmount = Number(coupon.discount_value || 0);
    }

    if (coupon.max_discount_amount !== null && coupon.max_discount_amount !== undefined) {
      discountAmount = Math.min(discountAmount, Number(coupon.max_discount_amount));
    }

    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return {
      success: true,
      data: {
        discount_amount: Math.round(discountAmount),
        shipping_fee: nextShippingFee,
        coupon_code: coupon.coupon_code,
      },
    };
  }
}
