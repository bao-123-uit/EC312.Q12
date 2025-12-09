import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class ProductService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProducts(limit = 10) {
    const result = await this.supabaseService.getProducts(limit);
    return result.data || [];
  }

  async getProductById(productId: number) {
    const result = await this.supabaseService.getProductById(productId);
    return result.data || null;
  }
}
