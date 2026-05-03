import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

export interface PromotionDeal {
  id: number;
  title: string;
  description: string;
  discount: string;
  code: string;
  image: string;
  endDate: string;
  tag?: string;
}

export interface PromotionResponse {
  featured: PromotionDeal[];
  deals: PromotionDeal[];
}

@Injectable()
export class PromotionService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPromotions(): Promise<PromotionResponse> {
    const [couponResult, bundleResult] = await Promise.all([
      this.supabaseService.getActiveCoupons(),
      this.supabaseService.getActiveBundleDeals(),
    ]);

    const coupons = couponResult.data || [];
    const bundles = bundleResult.data || [];

    if (couponResult.error) {
      console.error('Failed to load coupons:', couponResult.error);
    }

    if (bundleResult.error) {
      console.error('Failed to load bundle deals:', bundleResult.error);
    }

    const mappedBundles = bundles.map((bundle: any) => this.mapBundleDeal(bundle));
    const mappedCoupons = coupons.map((coupon: any) => this.mapCoupon(coupon));

    const featured = mappedBundles.slice(0, 3);
    const deals = [...mappedBundles, ...mappedCoupons];

    return { featured, deals };
  }

  private mapCoupon(coupon: any): PromotionDeal {
    const discount = this.formatCouponDiscount(coupon.coupon_type, coupon.discount_value);

    return {
      id: coupon.coupon_id,
      title: coupon.description || coupon.coupon_code || 'Coupon',
      description: coupon.description || 'Discount coupon',
      discount,
      code: coupon.coupon_code || '',
      image: coupon.image_url || '',
      endDate: this.formatDate(coupon.valid_to),
      tag: coupon.coupon_type ? String(coupon.coupon_type).toUpperCase() : undefined,
    };
  }

  private mapBundleDeal(bundle: any): PromotionDeal {
    const discount = this.formatBundleDiscount(bundle);

    return {
      id: bundle.bundle_id,
      title: bundle.bundle_name || 'Bundle Deal',
      description: bundle.description || 'Bundle promotion',
      discount,
      code: bundle.bundle_slug || '',
      image: bundle.image_url || '',
      endDate: this.formatDate(bundle.valid_to),
      tag: bundle.bundle_type ? String(bundle.bundle_type).toUpperCase() : undefined,
    };
  }

  private formatDate(value?: string | null): string {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('vi-VN');
  }

  private formatCouponDiscount(type?: string | null, value?: number | null): string {
    if (value === null || value === undefined) return '';
    const normalized = String(type || '').toLowerCase();
    if (normalized.includes('percent') || normalized.includes('percentage')) {
      return `${value}%`;
    }
    if (normalized.includes('free_shipping') || normalized.includes('freeship')) {
      return 'FREE SHIP';
    }
    return String(value);
  }

  private formatBundleDiscount(bundle: any): string {
    if (bundle.discount_percent !== null && bundle.discount_percent !== undefined) {
      return `${bundle.discount_percent}%`;
    }
    if (bundle.discount_amount !== null && bundle.discount_amount !== undefined) {
      return String(bundle.discount_amount);
    }
    if (bundle.buy_quantity && bundle.get_quantity) {
      return `Mua ${bundle.buy_quantity} Tang ${bundle.get_quantity}`;
    }
    return 'DEAL';
  }
}
