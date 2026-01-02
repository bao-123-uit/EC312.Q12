import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { GiftModule } from './gift/gift.module';
import { DesignModule } from './design/design.module';
import { MessengerModule } from './messenger/messenger.module';
import { PhoneModelModule } from './phone-model/phone-model.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
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
    GiftModule,
    DesignModule,
    MessengerModule,
    PhoneModelModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
