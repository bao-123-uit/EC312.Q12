import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance để share giữa các repository (lazy initialization)
let supabaseInstance: SupabaseClient | null = null;

/**
 * Lấy Supabase client (lazy initialization)
 * Chỉ khởi tạo khi thực sự cần dùng, sau khi env đã được load
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    supabaseInstance = createClient(
      process.env.SUPABASE_URL || '',
      supabaseKey,
    );
  }
  return supabaseInstance;
}

/**
 * Base Repository - Cung cấp Supabase client cho các repository khác
 */
export class BaseRepository {
  // Lazy getter để tránh khởi tạo khi import
  protected get supabase(): SupabaseClient {
    return getSupabaseClient();
  }

  /**
   * Generic query cho bất kỳ bảng nào
   */
  async query(tableName: string, filters?: any, limit?: number) {
    let query = this.supabase.from(tableName).select('*');
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    return { data, error };
  }
}
