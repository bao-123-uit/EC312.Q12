import { getSupabaseClient } from './base.repository';

/**
 * Inventory Repository - Quản lý tồn kho
 */
export class InventoryRepository {
  private get supabase() { return getSupabaseClient(); }

  async getInventory(productId: number) {
    const { data, error } = await this.supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId);
    return { data, error };
  }

  async updateInventory(inventoryId: number, updates: any) {
    const { data, error } = await this.supabase
      .from('inventory')
      .update(updates)
      .eq('inventory_id', inventoryId)
      .select();
    return { data, error };
  }
}

// Export singleton instance
export const inventoryRepository = new InventoryRepository();
