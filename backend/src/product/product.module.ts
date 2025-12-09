import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, SupabaseService],
  exports: [ProductService],
})
export class ProductModule {}
