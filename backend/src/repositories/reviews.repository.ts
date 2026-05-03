import { getSupabaseClient } from './base.repository';

/**
 * Reviews Repository - Quản lý đánh giá sản phẩm
 */
export class ReviewsRepository {
  private get supabase() { return getSupabaseClient(); }

  async getAllReviews(limit = 50) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async getProductReviews(productId: number) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async getReviewById(reviewId: number) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .select('*')
      .eq('review_id', reviewId)
      .single();
    return { data, error };
  }

  async createReview(reviewData: any) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .insert([reviewData])
      .select();
    return { data, error };
  }

  async updateReview(reviewId: number, reviewData: any) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .update(reviewData)
      .eq('review_id', reviewId)
      .select();
    return { data, error };
  }

  async deleteReview(reviewId: number) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .delete()
      .eq('review_id', reviewId);
    return { data, error };
  }

  async approveReview(reviewId: number, isApproved: boolean) {
    const { data, error } = await this.supabase
      .from('product_reviews')
      .update({ is_approved: isApproved })
      .eq('review_id', reviewId)
      .select();
    return { data, error };
  }
}

// Export singleton instance
export const reviewsRepository = new ReviewsRepository();
