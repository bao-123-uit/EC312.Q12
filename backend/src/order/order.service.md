import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class OrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOrders(limit = 20) {
    const result = await this.supabaseService.getOrders(limit);
    return result.data || [];
  }

  async getOrderById(orderId: number) {
    const result = await this.supabaseService.getOrderById(orderId);
    return result.data || null;
  }

  async getOrdersByCustomer(customerId: number) {
    const result = await this.supabaseService.getOrdersByCustomer(customerId);
    return result.data || [];
  }

  async createOrder(orderData: any) {
    // orderData cần có: customer_id, address, products, note, ...
    const result = await this.supabaseService.createOrder(orderData);
    if (result.error) {
      return { success: false, message: result.error.message };
    }
    return { success: true, data: result.data };
  }

  async updateOrderStatus(orderId: number, newStatus: string) {
    const result = await this.supabaseService.updateOrderStatus(orderId, newStatus);
    if (result.error) {
      return { success: false, message: result.error.message };
    }
    return { success: true, data: result.data };
  }

  async updatePaymentStatus(orderId: number, paymentStatus: string) {
    const result = await this.supabaseService.updatePaymentStatus(orderId, paymentStatus);
    if (result.error) {
      return { success: false, message: result.error.message };
    }
    return { success: true, data: result.data };
  }
}
