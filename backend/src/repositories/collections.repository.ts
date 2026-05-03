import { getSupabaseClient } from './base.repository';

/**
 * Collections Repository - Quản lý bộ sưu tập sản phẩm
 */
export class CollectionsRepository {
  private get supabase() { return getSupabaseClient(); }

  async getAllDesignCollections() {
    const { data, error } = await this.supabase
      .from('design_collections')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async getDesignCollectionsByType(type: string) {
    const { data, error } = await this.supabase
      .from('design_collections')
      .select('*')
      .eq('is_active', true)
      .ilike('collection_name', type === 'seasonal' ? '%Noel%|%Valentine%|%Tết%' : '%')
      .order('display_order', { ascending: true });
    return { data, error };
  }

  async getDesignCollectionBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('design_collections')
      .select('*')
      .eq('collection_slug', slug)
      .eq('is_active', true)
      .single();
    return { data, error };
  }

  async getProductsByDesignCollection(collectionId: number) {
    const { data: pcData, error: pcError } = await this.supabase
      .from('product_collections')
      .select('product_id')
      .eq('collection_id', collectionId)
      .order('display_order', { ascending: true });

    if (pcError || !pcData || pcData.length === 0) {
      return { data: [], error: pcError };
    }

    const productIds = pcData.map(pc => pc.product_id);

    const { data: products, error: prodError } = await this.supabase
      .from('products')
      .select(`
        *,
        product_images (
          image_url,
          is_primary
        )
      `)
      .in('product_id', productIds)
      .eq('status', 'active');

    return { data: products || [], error: prodError };
  }

  async getDesignCollectionProductCounts() {
    const { data: collections, error: colError } = await this.supabase
      .from('design_collections')
      .select('collection_id, collection_name, collection_slug')
      .eq('is_active', true);

    if (colError) return { data: null, error: colError };

    const counts: Record<string, number> = {};
    
    for (const col of collections || []) {
      const { data: pcData } = await this.supabase
        .from('product_collections')
        .select('product_id', { count: 'exact' })
        .eq('collection_id', col.collection_id);
      
      counts[col.collection_slug] = pcData?.length || 0;
    }

    return { data: counts, error: null };
  }
}

// Export singleton instance
export const collectionsRepository = new CollectionsRepository();
