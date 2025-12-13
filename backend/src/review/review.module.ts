import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, SupabaseService],
  exports: [ReviewService],
})
export class ReviewModule {}
