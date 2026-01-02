import { Module } from '@nestjs/common';
import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';
import { SupabaseService } from '../supabase.service';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [GiftController],
  providers: [GiftService, SupabaseService],
  exports: [GiftService],
})
export class GiftModule {}
