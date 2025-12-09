import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class CustomerService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getCustomers() {
    const result = await this.supabaseService.getCustomers();
    return result.data || [];
  }
}
