// backend/src/payment/payment.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { SupabaseService } from '../supabase.service';
import { OrderService } from '../order/order.service';

interface MomoConfig {
  accessKey: string;
  secretKey: string;
  partnerCode: string;
  endpoint: string;
}

@Injectable()
export class PaymentService {
  private momoConfig: MomoConfig = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    partnerCode: 'MOMO',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api',
  };

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly orderService: OrderService,
  ) {}

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

    // 1️⃣ Ghi payment_transactions
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
}
