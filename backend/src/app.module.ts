import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentController } from './payment.controller';
import { SupabaseService } from './supabase.service';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './category/category.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    ProductModule,
    OrderModule,
    CategoryModule,
    CustomerModule,
  ],
  controllers: [AppController, PaymentController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
