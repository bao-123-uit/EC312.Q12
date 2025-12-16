import { Module } from '@nestjs/common';
import { ShoppingCartController } from './shopping-cart.controller';
import { ShoppingCartService } from './shopping-cart.service';
import { SupabaseService } from '../supabase.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService,SupabaseService],
  exports: [ShoppingCartService],
})
export class ShoppingCartModule {}
