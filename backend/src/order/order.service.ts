import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class OrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOrders(limit = 20) {
    const result = await this.supabaseService.getOrders(limit);
    return result.data || [];
  }

  async getOrderById(orderId: number) {
    const result = await this.supabaseService.getOrderById(orderId);
    return result.data || null;
  }
}
