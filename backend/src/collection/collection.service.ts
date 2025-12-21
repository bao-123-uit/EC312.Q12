import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class CollectionService {
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  );

  // Lấy tất cả bộ sưu tập
  async getAllCollections() {
    try {
      const { data, error } = await this.supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('getAllCollections error:', error.message);
        return []; // Trả về mảng rỗng
      }
      return data || [];
    } catch (error: any) {
      console.error('getAllCollections error:', error.message);
      return [];
    }
  }

  // Lấy bộ sưu tập theo loại (main, seasonal)
  async getCollectionsByType(type: string) {
    try {
      const { data, error } = await this.supabase
        .from('collections')
        .select('*')
        .eq('collection_type', type)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('getCollectionsByType error:', error.message);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.error('getCollectionsByType error:', error.message);
      return [];
    }
  }

  // Lấy bộ sưu tập theo slug
  async getCollectionBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('collections')
      .select('*')
      .eq('collection_slug', slug)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // Lấy số lượng sản phẩm trong mỗi bộ sưu tập
  async getCollectionProductCounts() {
    try {
      // Lấy tất cả collections
      const { data: collections, error: collectionsError } = await this.supabase
        .from('collections')
        .select('collection_id, collection_slug')
        .eq('is_active', true);

      if (collectionsError) {
        console.error('Collections table error:', collectionsError.message);
        return {}; // Trả về object rỗng nếu table không tồn tại
      }

      // Đếm sản phẩm cho mỗi collection
      const counts: Record<string, number> = {};
      
      for (const collection of collections || []) {
        const { count, error } = await this.supabase
          .from('product_collections')
          .select('*', { count: 'exact', head: true })
          .eq('collection_id', collection.collection_id);

        if (!error) {
          counts[collection.collection_slug] = count || 0;
        }
      }

      return counts;
    } catch (error: any) {
      console.error('getCollectionProductCounts error:', error.message);
      return {}; // Trả về object rỗng khi có lỗi
    }
  }

  // Lấy sản phẩm trong một bộ sưu tập
  async getProductsByCollection(slug: string) {
    // Lấy collection_id từ slug
    const { data: collection, error: collectionError } = await this.supabase
      .from('collections')
      .select('collection_id')
      .eq('collection_slug', slug)
      .single();

    if (collectionError || !collection) {
      throw new Error('Collection not found');
    }

    // Lấy product_ids từ product_collections
    const { data: productCollections, error: pcError } = await this.supabase
      .from('product_collections')
      .select('product_id')
      .eq('collection_id', collection.collection_id)
      .order('display_order', { ascending: true });

    if (pcError) {
      throw new Error(pcError.message);
    }

    if (!productCollections || productCollections.length === 0) {
      return [];
    }

    const productIds = productCollections.map(pc => pc.product_id);

    // Lấy thông tin sản phẩm
    const { data: products, error: productsError } = await this.supabase
      .from('products')
      .select('*')
      .in('product_id', productIds);

    if (productsError) {
      throw new Error(productsError.message);
    }

    return products;
  }

  // Thêm sản phẩm vào bộ sưu tập
  async addProductToCollection(productId: number, collectionId: number, displayOrder: number = 0) {
    const { data, error } = await this.supabase
      .from('product_collections')
      .insert({
        product_id: productId,
        collection_id: collectionId,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // Xóa sản phẩm khỏi bộ sưu tập
  async removeProductFromCollection(productId: number, collectionId: number) {
    const { error } = await this.supabase
      .from('product_collections')
      .delete()
      .eq('product_id', productId)
      .eq('collection_id', collectionId);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  }

  // Cập nhật các bộ sưu tập của sản phẩm (xóa cũ, thêm mới)
  async updateProductCollections(productId: number, collectionIds: number[]) {
    // Xóa tất cả liên kết cũ
    const { error: deleteError } = await this.supabase
      .from('product_collections')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Thêm các liên kết mới
    if (collectionIds.length > 0) {
      const inserts = collectionIds.map((collectionId, index) => ({
        product_id: productId,
        collection_id: collectionId,
        display_order: index,
      }));

      const { error: insertError } = await this.supabase
        .from('product_collections')
        .insert(inserts);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    return { success: true };
  }

  // Lấy các bộ sưu tập của một sản phẩm
  async getProductCollections(productId: number) {
    try {
      const { data, error } = await this.supabase
        .from('product_collections')
        .select(`
          collection_id,
          design_collections (
            collection_id,
            collection_name,
            collection_slug,
            is_active
          )
        `)
        .eq('product_id', productId);

      if (error) {
        console.error('getProductCollections error:', error.message);
        return []; // Trả về mảng rỗng thay vì throw error
      }
      return data || [];
    } catch (error: any) {
      console.error('getProductCollections error:', error.message);
      return [];
    }
  }

  // Tạo bộ sưu tập mới
  async createCollection(collectionData: {
    collection_name: string;
    collection_slug: string;
    collection_description?: string;
    collection_image?: string;
    collection_gradient?: string;
    collection_icon?: string;
    collection_type?: string;
    display_order?: number;
  }) {
    const { data, error } = await this.supabase
      .from('collections')
      .insert(collectionData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // Cập nhật bộ sưu tập
  async updateCollection(collectionId: number, collectionData: Partial<{
    collection_name: string;
    collection_description: string;
    collection_image: string;
    collection_gradient: string;
    collection_icon: string;
    collection_type: string;
    display_order: number;
    is_active: boolean;
  }>) {
    const { data, error } = await this.supabase
      .from('collections')
      .update(collectionData)
      .eq('collection_id', collectionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  // Xóa bộ sưu tập
  async deleteCollection(collectionId: number) {
    // Xóa liên kết với sản phẩm trước
    await this.supabase
      .from('product_collections')
      .delete()
      .eq('collection_id', collectionId);

    // Xóa bộ sưu tập
    const { error } = await this.supabase
      .from('collections')
      .delete()
      .eq('collection_id', collectionId);

    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  }
}
