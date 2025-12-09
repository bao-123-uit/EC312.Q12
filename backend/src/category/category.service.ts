import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class CategoryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getCategories() {
    const result = await this.supabaseService.getCategories();
    return result.data || [];
  }

  async getRootCategories() {
    const result = await this.supabaseService.getRootCategories();
    return result.data || [];
  }

  async getCategoryBySlug(slug: string) {
    const result = await this.supabaseService.getCategoryBySlug(slug);
    return result.data || null;
  }

  async getChildCategories(parentId: number) {
    const result = await this.supabaseService.getChildCategories(parentId);
    return result.data || [];
  }

  async getCategoryById(categoryId: number) {
    const result = await this.supabaseService.getCategoryById(categoryId);
    return result.data || null;
  }
}
