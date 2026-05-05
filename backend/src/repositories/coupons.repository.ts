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

  async incrementUsedCount(couponId: number, nextUsedCount: number) {
    const { data, error } = await this.supabase
      .from('coupons')
      .update({ used_count: nextUsedCount })
      .eq('coupon_id', couponId)
      .select('coupon_id, used_count')
      .single();
    return { data, error };
  }

  async getAllCoupons() {
    const { data, error } = await this.supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async createCoupon(payload: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('coupons')
      .insert(payload)
      .select('*')
      .single();
    return { data, error };
  }

  async updateCoupon(couponId: number, payload: Record<string, any>) {
    const { data, error } = await this.supabase
      .from('coupons')
      .update(payload)
      .eq('coupon_id', couponId)
      .select('*')
      .single();
    return { data, error };
  }

  async deleteCoupon(couponId: number) {
    const { data, error } = await this.supabase
      .from('coupons')
      .delete()
      .eq('coupon_id', couponId)
      .select('*')
      .single();
    return { data, error };
  }
}

// Export singleton instance
export const couponsRepository = new CouponsRepository();
