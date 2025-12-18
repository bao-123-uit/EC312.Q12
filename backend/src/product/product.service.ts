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

  async createProduct(productData: any) {
    const result = await this.supabaseService.createProduct(productData);
    if (result.error) {
      return { success: false, message: result.error.message };
    }
    return { success: true, data: result.data };
  }

  async updateProduct(productId: number, productData: any) {
    const result = await this.supabaseService.updateProduct(productId, productData);
    if (result.error) {
      return { success: false, message: result.error.message };
    }
    return { success: true, data: result.data };
  }

  async deleteProduct(productId: number) {
    const result = await this.supabaseService.deleteProduct(productId);
    if (result.error) {
      return { success: false, message: result.error.message };
    }
    return { success: true, message: 'Đã ẩn sản phẩm thành công' };
  }

  async getProductsBySeason(season: string) {
    const result = await this.supabaseService.getProductsBySeason(season);
    return result.data || [];
  }

  async getSeasonProductCounts() {
    return await this.supabaseService.getSeasonProductCounts();
  }
}
