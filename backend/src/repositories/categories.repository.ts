import { getSupabaseClient } from './base.repository';

/**
 * Categories Repository - Quản lý danh mục sản phẩm
 */
export class CategoriesRepository {
  private get supabase() { return getSupabaseClient(); }

  async getAllCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('category_id', { ascending: true });
    return { data, error };
  }

  async syncCategoryListFromDatabase() {
    // Đồng bộ theo trạng thái hiện có trong CSDL: trả đầy đủ danh mục để admin refresh list.
    return this.getAllCategories();
  }

  async getCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async getCategoriesWithProductCount() {
    const { data: categories, error: catError } = await this.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (catError) return { data: null, error: catError };

    const { data: products, error: prodError } = await this.supabase
      .from('products')
      .select('category_id, status');

    if (prodError) return { data: categories, error: prodError };

    const productCountMap: Record<number, number> = {};
    products?.forEach((p: any) => {
      if (p.category_id) {
        const status = (p.status || '').toLowerCase();
        if (status === 'active' || status === '' || !p.status) {
          productCountMap[p.category_id] = (productCountMap[p.category_id] || 0) + 1;
        }
      }
    });

    const categoriesWithCount = categories?.map((cat: any) => ({
      ...cat,
      product_count: productCountMap[cat.category_id] || 0
    }));

    return { data: categoriesWithCount, error: null };
  }

  async getCategoryById(categoryId: number) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('category_id', categoryId)
      .single();
    return { data, error };
  }

  async getCategoryBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('category_slug', slug)
      .eq('is_active', true)
      .single();
    return { data, error };
  }

  async getRootCategories() {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .is('parent_category_id', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async getChildCategories(parentId: number) {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('parent_category_id', parentId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async createCategory(categoryData: any) {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([categoryData])
      .select();
    return { data, error };
  }

  async updateCategory(categoryId: number, categoryData: any) {
    const { data, error } = await this.supabase
      .from('categories')
      .update(categoryData)
      .eq('category_id', categoryId)
      .select();
    return { data, error };
  }

  // Soft delete
  async deleteCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from('categories')
      .update({ is_active: false })
      .eq('category_id', categoryId)
      .select();
    return { data, error };
  }
}

// Export singleton instance
export const categoriesRepository = new CategoriesRepository();
