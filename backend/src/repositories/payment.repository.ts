import { getSupabaseClient } from './base.repository';

/**
 * Payment Repository - Quản lý giao dịch thanh toán
 */
export class PaymentRepository {
  private get supabase() { return getSupabaseClient(); }

  async createPaymentTransaction(transactionData: any) {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .insert([transactionData])
      .select();
    return { data, error };
  }

  async getPaymentTransactionsByOrder(orderId: number) {
    const { data, error } = await this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId);
    return { data, error };
  }
}

// Export singleton instance
export const paymentRepository = new PaymentRepository();
