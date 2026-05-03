import { Module } from '@nestjs/common';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [PromotionController],
  providers: [PromotionService, SupabaseService],
})
export class PromotionModule {}
