import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';

interface CreateOrderDto {
  items: {
    product_id: number;
    variant_id?: number;
    phone_model_id?: number;
    phone_model_name?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }[];

  shipping_address: {
    full_name: string;
    phone: string;
    address_line1: string;
    ward?: string;
    district?: string;
    city: string;
  };

  subtotal: number;
  discount_amount?: number;
  shipping_fee?: number;
  tax_amount?: number;
  total_amount: number;

  payment_method?: string;
  coupon_code?: string;
  customer_note?: string;
}


@Injectable()
export class OrderService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Tạo mã đơn hàng unique
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GT${timestamp}${random}`;
  }

  /**
   * Tạo đơn hàng mới - LUỒNG CHÍNH
   */
  async createOrder(userId: string, orderDto: CreateOrderDto) {
    try {
      const {
        items,
        shipping_address,
        subtotal,
        discount_amount = 0,
        shipping_fee = 0,
        tax_amount = 0,
        total_amount,
        payment_method,
        coupon_code,
        customer_note,
      } = orderDto;

      if (!items || items.length === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      // ❌ XÓA: let subtotal = 0;
      // ❌ XÓA: toàn bộ reduce + tính lại tiền

      // 1️⃣ Generate order number
      const orderNumber = this.generateOrderNumber();

      // 2️⃣ Create order
      const { data: orderData, error: orderError } =
        await this.supabaseService.createFullOrder({
          customer_id: userId,
          order_number: orderNumber,
          subtotal,
          discount_amount,
          shipping_fee,
          // tax_amount,
          total_amount,
          payment_method,
          // coupon_code,
          customer_note,
          shipping_full_name: shipping_address.full_name,
          shipping_phone: shipping_address.phone,
          shipping_address: shipping_address.address_line1,
          shipping_ward: shipping_address.ward,
          shipping_district: shipping_address.district,
          shipping_city: shipping_address.city,
        });

      if (orderError || !orderData || orderData.length === 0) {
        throw new BadRequestException(orderError?.message || 'Không thể tạo đơn hàng');
      }

      const orderId = orderData[0].order_id;

      // 3️⃣ Create order items
      for (const item of items) {
        const { data: itemData, error: itemError } = await this.supabaseService.createFullOrderItem({
          order_id: orderId,
          product_id: item.product_id,
          product_name: item.product_name,
          sku: `SKU-${item.product_id}`,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount || 0,
          total_price: item.unit_price * item.quantity - (item.discount_amount || 0),
          phone_model_id: item.phone_model_id || null,
          phone_model_name: item.phone_model_name || null,
        });

        // THÊM LOG ĐỂ DEBUG
        if (itemError) {
          console.error('Order item insert error:', itemError);
          throw new BadRequestException(`Không thể tạo order item: ${itemError.message}`);
        }
      }
      

      await this.supabaseService.clearShoppingCart(userId);

      return {
        success: true,
        data: {
          order_id: orderId,
          order_number: orderNumber,
          total_amount,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Lỗi tạo đơn hàng');
    }
  }


  /**
   * Lấy tất cả orders (ADMIN)
   */
  async getAllOrders() {
    const { data, error } = await this.supabaseService.getOrders();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /**
   * Lấy orders của customer
   */
  async getOrdersByUserId(userId: string) {
    const { data, error } = await this.supabaseService.getOrdersByCustomer(userId as any);
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /**
   * Lấy chi tiết order theo ID
   */
  async getOrderById(orderId: string) {
    const { data, error } = await this.supabaseService.getOrderWithItems(Number(orderId));
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /**
   * Lấy chi tiết order theo Order Number
   */
  async getOrderByNumber(orderNumber: string) {
    const { data, error } = await this.supabaseService.getOrderWithItemsByNumber(orderNumber);
    if (error) throw new BadRequestException(error.message);
    if (!data) throw new BadRequestException('Không tìm thấy đơn hàng');
    return data;
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateOrderStatus(orderId: string, newStatus: string) {
    const { data, error } = await this.supabaseService.updateOrderStatus(Number(orderId), newStatus);
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const { data, error } = await this.supabaseService.updatePaymentStatus(Number(orderId), paymentStatus);
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }
}