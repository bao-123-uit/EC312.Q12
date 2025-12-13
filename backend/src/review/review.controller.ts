import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Lấy tất cả đánh giá (cho admin)
  @Get()
  async getAllReviews(@Query('limit') limit?: string) {
    return await this.reviewService.getAllReviews(limit ? parseInt(limit) : 50);
  }

  // Lấy đánh giá theo sản phẩm
  @Get('product/:productId')
  async getProductReviews(@Param('productId') productId: string) {
    return await this.reviewService.getProductReviews(parseInt(productId));
  }

  // Lấy đánh giá theo ID
  @Get(':id')
  async getReviewById(@Param('id') id: string) {
    return await this.reviewService.getReviewById(parseInt(id));
  }

  // Tạo đánh giá mới (khách hàng gửi)
  @Post()
  async createReview(@Body() reviewData: {
    product_id: number;
    customer_id?: number;
    customer_name: string;
    customer_email?: string;
    rating: number;
    review_title?: string;
    review_text: string;
    is_approved?: boolean;
  }) {
    // Mặc định chưa duyệt
    const data = {
      ...reviewData,
      is_approved: reviewData.is_approved ?? false,
      created_at: new Date().toISOString()
    };
    return await this.reviewService.createReview(data);
  }

  // Cập nhật đánh giá
  @Put(':id')
  async updateReview(@Param('id') id: string, @Body() reviewData: any) {
    return await this.reviewService.updateReview(parseInt(id), reviewData);
  }

  // Duyệt/từ chối đánh giá
  @Put(':id/approve')
  async approveReview(@Param('id') id: string, @Body() body: { is_approved: boolean }) {
    return await this.reviewService.approveReview(parseInt(id), body.is_approved);
  }

  // Xóa đánh giá
  @Delete(':id')
  async deleteReview(@Param('id') id: string) {
    return await this.reviewService.deleteReview(parseInt(id));
  }
}
