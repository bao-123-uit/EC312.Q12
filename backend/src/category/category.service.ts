import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class CategoryService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllCategories() {
    const result = await this.supabaseService.getAllCategories();
    return result.data || [];
  }

  async syncCategoryListFromDatabase() {
    const result = await this.supabaseService.syncCategoryListFromDatabase();
    return {
      success: !result.error,
      message: result.error ? 'Không thể đồng bộ danh mục từ CSDL' : 'Đồng bộ danh mục thành công',
      total: result.data?.length || 0,
      data: result.data || [],
      error: result.error || null,
    };
  }

  async getCategories() {
    const result = await this.supabaseService.getCategories();
    return result.data || [];
  }

  async getCategoriesWithProductCount() {
    const result = await this.supabaseService.getCategoriesWithProductCount();
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

  async createCategory(categoryData: any) {
    const result = await this.supabaseService.createCategory(categoryData);
    return result;
  }

  async updateCategory(categoryId: number, categoryData: any) {
    const result = await this.supabaseService.updateCategory(categoryId, categoryData);
    return result;
  }

  async deleteCategory(categoryId: number) {
    const result = await this.supabaseService.deleteCategory(categoryId);
    return result;
  }
}
