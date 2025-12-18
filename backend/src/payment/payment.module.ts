// backend/src/payment/payment.module.ts
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SupabaseService } from '../supabase.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [OrderModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    SupabaseService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
