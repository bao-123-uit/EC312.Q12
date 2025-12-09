import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { SupabaseService } from '../supabase.service';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, SupabaseService],
  exports: [CustomerService],
})
export class CustomerModule {}
