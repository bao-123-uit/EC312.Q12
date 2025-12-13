import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class ReviewService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllReviews(limit = 50) {
    const result = await this.supabaseService.getAllReviews(limit);
    return result;
  }

  async getProductReviews(productId: number) {
    const result = await this.supabaseService.getProductReviews(productId);
    return result;
  }

  async getReviewById(reviewId: number) {
    const result = await this.supabaseService.getReviewById(reviewId);
    return result;
  }

  async createReview(reviewData: any) {
    const result = await this.supabaseService.createReview(reviewData);
    return result;
  }

  async updateReview(reviewId: number, reviewData: any) {
    const result = await this.supabaseService.updateReview(reviewId, reviewData);
    return result;
  }

  async deleteReview(reviewId: number) {
    const result = await this.supabaseService.deleteReview(reviewId);
    return result;
  }

  async approveReview(reviewId: number, isApproved: boolean) {
    const result = await this.supabaseService.approveReview(reviewId, isApproved);
    return result;
  }
}
