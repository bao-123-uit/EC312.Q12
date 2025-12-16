// backend/src/order/order.service.ts

import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

interface CreateOrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

@Injectable()
export class OrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * ADMIN: Lấy tất cả orders
   */
  async getAllOrders() {
    const { data, error } = await this.supabaseService.getOrders();
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * CUSTOMER: Lấy orders theo userId (UUID)
   */
  async getOrdersByUserId(userId: string) {
    const { data, error } =
      await this.supabaseService.getOrdersByCustomer(userId as any);
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Lấy chi tiết 1 order
   */
  async getOrderById(orderId: string) {
    const { data, error } =
      await this.supabaseService.getOrderById(Number(orderId));
    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * CUSTOMER: Tạo order mới
   */
  async createOrder(
    userId: string,
    items: CreateOrderItem[],
    shippingAddress: string,
  ) {
    // 1️⃣ Tạo order
    const orderPayload = {
      customer_id: userId,
      shipping_address: shippingAddress,
      order_status: 'pending',
      payment_status: 'unpaid',
      created_at: new Date().toISOString(),
    };

    const { data: order, error } =
      await this.supabaseService.createOrder(orderPayload);

    if (error || !order || order.length === 0) {
      throw new Error(error?.message || 'Không tạo được order');
    }

    const orderId = order[0].order_id;

    // 2️⃣ Tạo order_items
    for (const item of items) {
      await this.supabaseService.createOrderItem({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    return {
      success: true,
      order_id: orderId,
    };
  }

  /**
   * ADMIN: Cập nhật trạng thái đơn hàng
   */
  async updateOrderStatus(orderId: string, newStatus: string) {
    const { data, error } =
      await this.supabaseService.updateOrderStatus(
        Number(orderId),
        newStatus,
      );

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data };
  }

  /**
   * ADMIN / PAYMENT: Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const { data, error } =
      await this.supabaseService.updatePaymentStatus(
        Number(orderId),
        paymentStatus,
      );

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, data };
  }
}
