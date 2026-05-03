// backend/src/payment/payment.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { SupabaseService } from '../supabase.service';
import { OrderService } from '../order/order.service';
import { PayOS } from '@payos/node';

interface MomoConfig {
  accessKey: string;
  secretKey: string;
  partnerCode: string;
  endpoint: string;
}

interface PayOSConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

interface PayOSPaymentItem {
  name: string;
  quantity: number;
  price: number;
}

interface CreatePayOSPaymentDto {
  orderCode: number;
  amount: number;
  description: string;
  items?: PayOSPaymentItem[];
  cancelUrl: string;
  returnUrl: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  expiredAt?: number;
  orderNumber?: string; // Thêm orderNumber để liên kết với đơn hàng
}

@Injectable()
export class PaymentService {
  private momoConfig: MomoConfig = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    partnerCode: 'MOMO',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api',
  };

  // PayOS Configuration - Sử dụng môi trường test
  private payosConfig: PayOSConfig = {
    clientId: process.env.PAYOS_CLIENT_ID || 'YOUR_CLIENT_ID',
    apiKey: process.env.PAYOS_API_KEY || 'YOUR_API_KEY',
    checksumKey: process.env.PAYOS_CHECKSUM_KEY || 'YOUR_CHECKSUM_KEY',
  };

  private payos: PayOS;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly orderService: OrderService,
  ) {
    // Khởi tạo PayOS instance với options object (SDK v2)
    this.payos = new PayOS({
      clientId: this.payosConfig.clientId,
      apiKey: this.payosConfig.apiKey,
      checksumKey: this.payosConfig.checksumKey,
    });
  }

  // ================== UTILS ==================
  private sign(raw: string): string {
    return crypto
      .createHmac('sha256', this.momoConfig.secretKey)
      .update(raw)
      .digest('hex');
  }

  // ================== CREATE PAYMENT ==================
  async createMomoPayment(payload: {
    amount: string;
    orderId: string;
    orderInfo: string;
    redirectUrl: string;
    ipnUrl: string;
    extraData?: string;
  }) {
    const {
      accessKey,
      partnerCode,
      endpoint,
    } = this.momoConfig;

    const requestType = 'payWithMethod';
    const requestId = payload.orderId;
    const autoCapture = true;
    const lang = 'vi';
    const extraData = payload.extraData || '';

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${payload.amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${payload.ipnUrl}` +
      `&orderId=${payload.orderId}` +
      `&orderInfo=${payload.orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${payload.redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = this.sign(rawSignature);

    const body = {
      partnerCode,
      partnerName: 'GoatTech Store',
      storeId: 'GoatTechStore',
      requestId,
      amount: payload.amount,
      orderId: payload.orderId,
      orderInfo: payload.orderInfo,
      redirectUrl: payload.redirectUrl,
      ipnUrl: payload.ipnUrl,
      requestType,
      autoCapture,
      lang,
      extraData,
      signature,
    };

    const response = await axios.post(`${endpoint}/create`, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  }

  // ================== IPN ==================
  async handleMomoIPN(body: any) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    const rawSignature =
      `accessKey=${this.momoConfig.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const expected = this.sign(rawSignature);
    if (expected !== signature) {
      throw new BadRequestException('Invalid MoMo signature');
    }

    //  Ghi payment_transactions
    await this.supabaseService.createPaymentTransaction({
      order_id: null, // map bằng order_number phía dưới
      payment_gateway: 'momo',
      transaction_ref: transId,
      amount,
      currency: 'VND',
      status: resultCode === 0 ? 'success' : 'failed',
      payment_date: new Date().toISOString(),
      response_data: JSON.stringify(body),
    });

    // 2️⃣ Update order
    if (resultCode === 0) {
      await this.orderService.updatePaymentStatus(orderId, 'paid');
    } else {
      await this.orderService.updatePaymentStatus(orderId, 'failed');
    }

    return {
      partnerCode,
      orderId,
      requestId,
      resultCode: 0,
      message: 'success',
      responseTime: Date.now(),
    };
  }

  // ================== CHECK STATUS ==================
  async checkMomoStatus(orderId: string) {
    const { accessKey, partnerCode, endpoint } = this.momoConfig;
    const requestId = orderId;

    const rawSignature =
      `accessKey=${accessKey}` +
      `&orderId=${orderId}` +
      `&partnerCode=${partnerCode}` +
      `&requestId=${requestId}`;

    const signature = this.sign(rawSignature);

    const body = {
      partnerCode,
      requestId,
      orderId,
      lang: 'vi',
      signature,
    };

    const response = await axios.post(`${endpoint}/query`, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  }

  // ================== REFUND ==================
  async refundMomo(payload: {
    orderId: string;
    transId: string;
    amount: string;
    description?: string;
  }) {
    const { accessKey, partnerCode, endpoint } = this.momoConfig;
    const requestId = `REFUND_${Date.now()}`;
    const description = payload.description || 'Hoàn tiền đơn hàng';

    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${payload.amount}` +
      `&description=${description}` +
      `&orderId=${payload.orderId}` +
      `&partnerCode=${partnerCode}` +
      `&requestId=${requestId}` +
      `&transId=${payload.transId}`;

    const signature = this.sign(rawSignature);

    const body = {
      partnerCode,
      requestId,
      orderId: payload.orderId,
      amount: payload.amount,
      transId: payload.transId,
      description,
      lang: 'vi',
      signature,
    };

    const response = await axios.post(`${endpoint}/refund`, body, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  }

  // ================== PAYOS PAYMENT ==================

  /**
   * Tạo thanh toán PayOS
   * @param payload Thông tin thanh toán
   */
  async createPayOSPayment(payload: CreatePayOSPaymentDto) {
    try {
      const paymentData = {
        orderCode: payload.orderCode,
        amount: payload.amount,
        description: payload.description,
        items: payload.items || [],
        cancelUrl: payload.cancelUrl,
        returnUrl: payload.returnUrl,
        buyerName: payload.buyerName,
        buyerEmail: payload.buyerEmail,
        buyerPhone: payload.buyerPhone,
        buyerAddress: payload.buyerAddress,
        expiredAt: payload.expiredAt,
      };

      // SDK v2: sử dụng paymentRequests.create()
      const paymentLinkResponse = await this.payos.paymentRequests.create(paymentData);

      console.log('✅ PayOS Payment Link Created:', paymentLinkResponse);

      return {
        success: true,
        data: paymentLinkResponse,
      };
    } catch (error: any) {
      console.error('❌ PayOS Create Payment Error:', error);
      throw new BadRequestException(error?.message || 'Lỗi tạo thanh toán PayOS');
    }
  }

  /**
   * Xử lý webhook từ PayOS
   * @param body Dữ liệu webhook
   */
  async handlePayOSWebhook(body: any) {
    try {
      // SDK v2: sử dụng webhooks.verify()
      const webhookData = await this.payos.webhooks.verify(body);

      console.log('🔔 PayOS Webhook Verified:', webhookData);

      const { orderCode, code, desc } = webhookData;
      const success = code === '00';

      // Ghi payment_transactions
      await this.supabaseService.createPaymentTransaction({
        order_id: null,
        payment_gateway: 'payos',
        transaction_ref: String(orderCode),
        amount: webhookData.amount || 0,
        currency: 'VND',
        status: success ? 'success' : 'failed',
        payment_date: new Date().toISOString(),
        response_data: JSON.stringify(webhookData),
      });

      // Update order status
      if (success || code === '00') {
        await this.orderService.updatePaymentStatus(String(orderCode), 'paid');
      } else {
        await this.orderService.updatePaymentStatus(String(orderCode), 'failed');
      }

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error: any) {
      console.error('❌ PayOS Webhook Error:', error);
      throw new BadRequestException('Invalid PayOS webhook signature');
    }
  }

  /**
   * Lấy thông tin thanh toán PayOS
   * @param orderCode Mã đơn hàng
   */
  async getPayOSPaymentInfo(orderCode: string | number) {
    try {
      // SDK v2: sử dụng paymentRequests.get()
      const numericOrderCode = typeof orderCode === 'string' ? parseInt(orderCode, 10) : orderCode;
      const paymentInfo = await this.payos.paymentRequests.get(numericOrderCode);

      console.log('📊 PayOS Payment Info:', paymentInfo);

      return {
        success: true,
        data: paymentInfo,
      };
    } catch (error: any) {
      console.error('❌ PayOS Get Payment Info Error:', error);
      throw new BadRequestException(error?.message || 'Lỗi lấy thông tin thanh toán PayOS');
    }
  }

  /**
   * Hủy thanh toán PayOS
   * @param orderCode Mã đơn hàng
   * @param reason Lý do hủy
   */
  async cancelPayOSPayment(orderCode: string | number, reason?: string) {
    try {
      // SDK v2: sử dụng paymentRequests.cancel()
      const numericOrderCode = typeof orderCode === 'string' ? parseInt(orderCode, 10) : orderCode;
      const cancelResponse = await this.payos.paymentRequests.cancel(numericOrderCode, reason);

      console.log('🚫 PayOS Payment Cancelled:', cancelResponse);

      // Update order status
      await this.orderService.updatePaymentStatus(String(orderCode), 'cancelled');

      return {
        success: true,
        data: cancelResponse,
      };
    } catch (error: any) {
      console.error('❌ PayOS Cancel Payment Error:', error);
      throw new BadRequestException(error?.message || 'Lỗi hủy thanh toán PayOS');
    }
  }

  /**
   * Xác minh dữ liệu webhook PayOS
   * @param body Dữ liệu webhook
   */
  async verifyPayOSWebhook(body: any) {
    try {
      // SDK v2: sử dụng webhooks.verify()
      return await this.payos.webhooks.verify(body);
    } catch (error) {
      throw new BadRequestException('Invalid PayOS webhook signature');
    }
  }

  /**
   * Tạo URL xác minh webhook cho PayOS
   */
  async confirmPayOSWebhook(webhookUrl: string) {
    try {
      // SDK v2: sử dụng webhooks.confirm()
      const result = await this.payos.webhooks.confirm(webhookUrl);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ PayOS Confirm Webhook Error:', error);
      throw new BadRequestException(error?.message || 'Lỗi xác minh webhook PayOS');
    }
  }

  /**
   * Xử lý kết quả thanh toán từ PayOS return URL
   * Kiểm tra và cập nhật trạng thái thanh toán
   */
  async handlePayOSReturn(orderCode: string | number, orderNumber: string) {
    try {
      // Lấy thông tin thanh toán từ PayOS
      const numericOrderCode = typeof orderCode === 'string' ? parseInt(orderCode, 10) : orderCode;
      const paymentInfo = await this.payos.paymentRequests.get(numericOrderCode);

      console.log('📊 PayOS Payment Return Info:', paymentInfo);

      const isPaid = paymentInfo.status === 'PAID';

      // Ghi payment_transactions
      await this.supabaseService.createPaymentTransaction({
        order_id: null,
        payment_gateway: 'payos',
        transaction_ref: String(orderCode),
        amount: paymentInfo.amount || 0,
        currency: 'VND',
        status: isPaid ? 'success' : 'pending',
        payment_date: new Date().toISOString(),
        response_data: JSON.stringify(paymentInfo),
      });

      // Cập nhật payment_status và order_status theo order_number
      if (isPaid) {
        await this.orderService.updatePaymentStatusByOrderNumber(orderNumber, 'paid');
        await this.orderService.updateOrderStatusByOrderNumber(orderNumber, 'success');
        console.log(`✅ Order ${orderNumber} updated: payment_status='paid', order_status='success'`);
      }

      return {
        success: true,
        isPaid,
        orderNumber,
        paymentInfo,
      };
    } catch (error: any) {
      console.error('❌ PayOS Return Handler Error:', error);
      return {
        success: false,
        isPaid: false,
        message: error?.message || 'Lỗi xử lý kết quả thanh toán',
      };
    }
  }
}
