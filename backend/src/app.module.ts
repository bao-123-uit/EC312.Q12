import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentController } from './payment.controller';
import { SupabaseService } from './supabase.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule],
  controllers: [AppController, PaymentController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
