import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentController } from './payment/payment.controller';
import { SupabaseService } from './supabase.service';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './category/category.module';
import { UsersModule } from './users/users.module';
import { ReviewModule } from './review/review.module';
import { ContactModule } from './contact/contact.module';
import { CollectionModule } from './collection/collection.module';
import { ShoppingCartModule } from './shopping-cart/shopping-cart.module';
import { WishlistModule } from './wishlist/wishlist.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    ProductModule,
    OrderModule,
    CategoryModule,
    UsersModule,
    ReviewModule,
    ContactModule,
    CollectionModule,
    ShoppingCartModule,
    WishlistModule,
  ],
  controllers: [AppController, PaymentController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
