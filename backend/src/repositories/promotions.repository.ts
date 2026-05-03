import { getSupabaseClient } from './base.repository';

/**
 * Promotions Repository - coupons and bundle deals
 */
export class PromotionsRepository {
  private get supabase() { return getSupabaseClient(); }

  async getActiveCoupons() {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('coupons')
      .select(
        'coupon_id, coupon_code, coupon_type, discount_value, description, valid_from, valid_to, is_active',
      )
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_to', now)
      .order('valid_to', { ascending: true });
    return { data, error };
  }

  async getActiveBundleDeals() {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('bundle_deals')
      .select(
        'bundle_id, bundle_name, bundle_slug, bundle_type, buy_quantity, get_quantity, discount_percent, discount_amount, description, valid_from, valid_to, is_active',
      )
      .eq('is_active', true)
      .lte('valid_from', now)
      .gte('valid_to', now)
      .order('valid_to', { ascending: true });
    return { data, error };
  }
}

export const promotionsRepository = new PromotionsRepository();
