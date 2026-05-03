import { getSupabaseClient } from './base.repository';

/**
 * Products Repository - Quản lý sản phẩm
 */
export class ProductsRepository {
  private get supabase() { return getSupabaseClient(); }

  // ============ PRODUCTS ============
  async getProducts(limit = 10) {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories (
          category_id,
          category_name
        ),
        product_images (
          image_id,
          image_url,
          is_primary,
          display_order
        )
      `)
      .neq('status', 'deleted')
      .limit(limit);

    const flattenedData = data?.map((p: any) => {
      // tìm ảnh chính
      const primaryImage =
        p.product_images?.find((img: any) => img.is_primary) ||
        p.product_images?.[0];

      return {
        ...p,
        category_name: p.categories?.category_name || 'Khác',
        image_url: primaryImage?.image_url || p.image_url || null,
        images: p.product_images || [],
      };
    });

    return { data: flattenedData, error };
  }

  async getProductById(productId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select(`
        *,
        categories (
          category_id,
          category_name
        )
      `)
      .eq('product_id', productId)
      .single();
    
    // Flatten category name
    const flattenedData = data ? {
      ...data,
      category_name: data.categories?.category_name || 'Khác'
    } : null;
    
    return { data: flattenedData, error };
  }

  async createProduct(productData: any) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([productData])
      .select();
    return { data, error };
  }

  async updateProduct(productId: number, productData: any) {
    console.log('=== SUPABASE UPDATE ===');
    console.log('Updating product_id:', productId);
    console.log('Raw data received:', JSON.stringify(productData, null, 2));
    
    // Chỉ lấy các field hợp lệ trong bảng products
    const validFields = [
      'product_name', 'product_slug', 'category_id', 'brand_id', 'sku',
      'description', 'short_description', 'price', 'sale_price', 'cost_price',
      'is_featured', 'is_new', 'is_bestseller', 'is_trending', 'status',
      'meta_title', 'meta_description', 'meta_keywords', 'image_url', 'season'
    ];
    
    const cleanData: any = {};
    for (const field of validFields) {
      if (productData[field] !== undefined) {
        // Xử lý các giá trị rỗng
        if (productData[field] === '' || productData[field] === null) {
          // Cho phép null cho các field optional
          if (['category_id', 'brand_id', 'sale_price', 'cost_price', 'season', 'image_url'].includes(field)) {
            cleanData[field] = null;
          }
          // Bỏ qua string rỗng cho các field khác
        } else {
          cleanData[field] = productData[field];
        }
      }
    }
    
    // Thêm updated_at
    cleanData.updated_at = new Date().toISOString();
    
    console.log('Clean data to update:', JSON.stringify(cleanData, null, 2));
    
    const { data, error } = await this.supabase
      .from('products')
      .update(cleanData)
      .eq('product_id', productId)
      .select();
    
    console.log('Supabase response - data:', JSON.stringify(data, null, 2));
    console.log('Supabase response - error:', error);
    
    return { data, error };
  }

  // Soft delete - đổi status thành 'deleted' thay vì xóa hẳn
  async deleteProduct(productId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .update({ status: 'deleted' })
      .eq('product_id', productId)
      .select();
    return { data, error };
  }

  async getProductsByCategory(categoryId: number) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);
    return { data, error };
  }

  // ============ PRODUCTS BY SEASON ============
  async getProductsBySeason(season: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('season', season)
      .eq('status', 'active');
    return { data, error };
  }

  async getSeasonProductCounts() {
    const seasons = ['noel', 'valentine', 'tet'];
    const counts: Record<string, number> = {};
    
    for (const season of seasons) {
      const { data } = await this.supabase
        .from('products')
        .select('product_id', { count: 'exact' })
        .eq('season', season)
        .eq('status', 'active');
      
      counts[season] = data?.length || 0;
    }
    
    return counts;
  }
}

// Export singleton instance
export const productsRepository = new ProductsRepository();
