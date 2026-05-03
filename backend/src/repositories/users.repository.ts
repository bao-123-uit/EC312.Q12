import { getSupabaseClient } from './base.repository';

/**
 * Users Repository - Quản lý người dùng và địa chỉ
 */
export class UsersRepository {
  private get supabase() { return getSupabaseClient(); }

  // ============ USERS ============
  async getCustomers() {
    const { data, error } = await this.supabase.from('users').select('*');
    return { data, error };
  }

  async getCustomerById(customerId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', customerId)
      .single();
    return { data, error };
  }

  async createCustomer(customerData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([customerData])
      .select();
    return { data, error };
  }

  async getCustomerByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    return { data, error };
  }

  async loginCustomer(email: string, password: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .single();
    return { data, error };
  }

  // ============ CUSTOMER ADDRESSES ============
  async createCustomerAddress(addressData: any) {
    const { data, error } = await this.supabase
      .from('customer_addresses')
      .insert([addressData])
      .select();
    return { data, error };
  }

  async getCustomerAddresses(customerId: number) {
    const { data, error } = await this.supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false });
    return { data, error };
  }
}

// Export singleton instance
export const usersRepository = new UsersRepository();
