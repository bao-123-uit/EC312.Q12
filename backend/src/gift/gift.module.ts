import { Module } from '@nestjs/common';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [GiftController],
  providers: [GiftService, SupabaseService],
  exports: [GiftService],
})
export class GiftModule {}
