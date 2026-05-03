import { getSupabaseClient } from './base.repository';

/**
 * Coupons Repository - Quản lý mã giảm giá
 */
export class CouponsRepository {
  private get supabase() { return getSupabaseClient(); }

  async getCoupon(couponCode: string) {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponCode)
      .eq('is_active', true)
      .single();
    return { data, error };
  }
}

// Export singleton instance
export const couponsRepository = new CouponsRepository();
