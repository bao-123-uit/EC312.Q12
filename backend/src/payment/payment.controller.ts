import { Controller, Post, Body, Res, Get, Query } from '@nestjs/common';
import axios from 'axios';
import type { Response } from 'express';
import * as crypto from 'crypto';
import { PaymentService } from './payment.service';

interface MomoConfig {
  accessKey: string;
  secretKey: string;
  partnerCode: string;
  endpoint: string;
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
  cancelUrl?: string;
  returnUrl?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  expiredAt?: number;
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  private momoConfig: MomoConfig = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    partnerCode: 'MOMO',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api',
  };

  // Tạo chữ ký HMAC SHA256
  private createSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.momoConfig.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  // POST /payment/momo - Tạo thanh toán MoMo
  @Post('momo')
  async createMomoPayment(@Body() body: any, @Res() res: Response) {
    try {
      const { accessKey, secretKey, partnerCode, endpoint } = this.momoConfig;
      
      const orderInfo = body.orderInfo || 'Thanh toán đơn hàng GoatTech';
      const redirectUrl = body.redirectUrl || 'http://localhost:3000/payment-result';
      const ipnUrl = body.ipnUrl || 'http://localhost:3001/payment/momo/ipn';
      const requestType = 'captureWallet'; // Đổi sang captureWallet cho test
      const amount = parseInt(body.amount) || 50000;
      const orderId = body.orderId || `${partnerCode}${Date.now()}`;
      const requestId = orderId;
      const extraData = body.extraData || '';
      const lang = 'vi';

      // Build raw signature theo thứ tự alphabet (amount phải là string trong signature)
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      
      const signature = this.createSignature(rawSignature);

      console.log('📝 MoMo Payment Request:');
      console.log('- Order ID:', orderId);
      console.log('- Amount:', amount);
      console.log('- Request Type:', requestType);
      console.log('- Raw Signature:', rawSignature);

      // Build request body - amount phải là number
      const requestBody = {
        partnerCode,
        partnerName: 'GoatTech Store',
        storeId: 'GoatTechStore',
        requestId,
        amount: amount, // Number, không phải string
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        extraData,
        signature,
      };

      // Call MoMo API
      const response = await axios.post(
        `${endpoint}/create`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log('✅ MoMo Response:', response.data);

      return res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (error: any) {
      console.error('❌ MoMo Payment Error:', error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tạo thanh toán MoMo',
        error: error?.response?.data || error?.message,
      });
    }
  }

  // POST /payment/momo/ipn - Nhận thông báo từ MoMo (IPN - Instant Payment Notification)
  @Post('momo/ipn')
  async handleMomoIPN(@Body() body: any, @Res() res: Response) {
    try {
      console.log('🔔 MoMo IPN Received:', body);

      const { 
        partnerCode, orderId, requestId, amount, orderInfo, 
        orderType, transId, resultCode, message, payType,
        responseTime, extraData, signature 
      } = body;

      // Verify signature
      const { accessKey } = this.momoConfig;
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      
      const expectedSignature = this.createSignature(rawSignature);

      if (signature !== expectedSignature) {
        console.error('❌ Invalid signature!');
        return res.status(400).json({ message: 'Invalid signature' });
      }

      // Xử lý kết quả thanh toán
      if (resultCode === 0) {
        console.log('✅ Payment Success!');
        console.log('- Transaction ID:', transId);
        console.log('- Order ID:', orderId);
        console.log('- Amount:', amount);
        
        // TODO: Cập nhật trạng thái đơn hàng trong database
        // await this.orderService.updatePaymentStatus(orderId, 'paid', transId);
      } else {
        console.log('❌ Payment Failed:', message);
        // TODO: Cập nhật trạng thái đơn hàng thất bại
      }

      // Phản hồi MoMo
      return res.status(200).json({
        partnerCode,
        requestId,
        orderId,
        resultCode: 0,
        message: 'success',
        responseTime: Date.now(),
      });
    } catch (error: any) {
      console.error('❌ IPN Error:', error.message);
      return res.status(500).json({ message: 'IPN processing failed' });
    }
  }

  // POST /payment/momo/check-status - Kiểm tra trạng thái thanh toán
  @Post('momo/check-status')
  async checkPaymentStatus(@Body() body: any, @Res() res: Response) {
    try {
      const { accessKey, secretKey, partnerCode, endpoint } = this.momoConfig;
      
      const orderId = body.orderId;
      const requestId = orderId;
      const lang = 'vi';

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'orderId is required',
        });
      }

      // Build raw signature
      const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
      const signature = this.createSignature(rawSignature);

      const requestBody = {
        partnerCode,
        requestId,
        orderId,
        lang,
        signature,
      };

      const response = await axios.post(
        `${endpoint}/query`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log('📊 Payment Status:', response.data);

      return res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (error: any) {
      console.error('❌ Check Status Error:', error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra trạng thái',
        error: error?.response?.data || error?.message,
      });
    }
  }

  // POST /payment/momo/refund - Hoàn tiền
  @Post('momo/refund')
  async refundPayment(@Body() body: any, @Res() res: Response) {
    try {
      const { accessKey, partnerCode, endpoint } = this.momoConfig;
      
      const orderId = body.orderId;
      const transId = body.transId;
      const amount = String(body.amount);
      const requestId = `REFUND${Date.now()}`;
      const description = body.description || 'Hoàn tiền đơn hàng';
      const lang = 'vi';

      if (!orderId || !transId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'orderId, transId và amount là bắt buộc',
        });
      }

      // Build raw signature
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&description=${description}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}&transId=${transId}`;
      const signature = this.createSignature(rawSignature);

      const requestBody = {
        partnerCode,
        requestId,
        orderId,
        amount,
        transId,
        description,
        lang,
        signature,
      };

      const response = await axios.post(
        `${endpoint}/refund`,
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      console.log('💰 Refund Response:', response.data);

      return res.status(200).json({
        success: true,
        data: response.data,
      });
    } catch (error: any) {
      console.error('❌ Refund Error:', error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hoàn tiền',
        error: error?.response?.data || error?.message,
      });
    }
  }

  // GET /payment/momo/result - Trang kết quả thanh toán (redirect từ MoMo)
  @Get('momo/result')
  async paymentResult(@Query() query: any, @Res() res: Response) {
    console.log('🔄 Payment Result Query:', query);
    
    const { resultCode, orderId, message, transId, amount } = query;
    
    // Redirect về frontend với kết quả
    const frontendUrl = `http://localhost:3000/payment-result?resultCode=${resultCode}&orderId=${orderId}&message=${encodeURIComponent(message || '')}&transId=${transId || ''}&amount=${amount || ''}`;
    
    return res.redirect(frontendUrl);
  }

  // ==================== PAYOS PAYMENT ====================

  // POST /payment/payos - Tạo thanh toán PayOS
  @Post('payos')
  async createPayOSPayment(@Body() body: CreatePayOSPaymentDto, @Res() res: Response) {
    try {
      const orderCode = body.orderCode || Date.now();
      const amount = body.amount || 50000;
      const description = body.description || 'Thanh toán đơn hàng GoatTech';
      const cancelUrl = body.cancelUrl || 'http://localhost:3000/payment-cancel';
      const returnUrl = body.returnUrl || 'http://localhost:3000/payment-result';

      console.log('📝 PayOS Payment Request:');
      console.log('- Order Code:', orderCode);
      console.log('- Amount:', amount);
      console.log('- Description:', description);

      const result = await this.paymentService.createPayOSPayment({
        orderCode,
        amount,
        description,
        items: body.items || [],
        cancelUrl,
        returnUrl,
        buyerName: body.buyerName,
        buyerEmail: body.buyerEmail,
        buyerPhone: body.buyerPhone,
        buyerAddress: body.buyerAddress,
        expiredAt: body.expiredAt,
      });

      console.log('✅ PayOS Response:', result);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ PayOS Payment Error:', error?.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi tạo thanh toán PayOS',
        error: error?.message,
      });
    }
  }

  // POST /payment/payos/webhook - Nhận webhook từ PayOS
  @Post('payos/webhook')
  async handlePayOSWebhook(@Body() body: any, @Res() res: Response) {
    try {
      console.log('🔔 PayOS Webhook Received:', body);

      const result = await this.paymentService.handlePayOSWebhook(body);

      console.log('✅ Webhook Processed:', result);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ PayOS Webhook Error:', error?.message);
      return res.status(400).json({
        success: false,
        message: error?.message || 'Invalid webhook',
      });
    }
  }

  // GET /payment/payos/check-status - Kiểm tra trạng thái thanh toán PayOS
  @Get('payos/check-status')
  async checkPayOSStatus(@Query('orderCode') orderCode: string, @Res() res: Response) {
    try {
      if (!orderCode) {
        return res.status(400).json({
          success: false,
          message: 'orderCode is required',
        });
      }

      console.log('📊 Checking PayOS Payment Status:', orderCode);

      const result = await this.paymentService.getPayOSPaymentInfo(orderCode);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ PayOS Check Status Error:', error?.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra trạng thái PayOS',
        error: error?.message,
      });
    }
  }

  // POST /payment/payos/cancel - Hủy thanh toán PayOS
  @Post('payos/cancel')
  async cancelPayOSPayment(@Body() body: { orderCode: string; reason?: string }, @Res() res: Response) {
    try {
      const { orderCode, reason } = body;

      if (!orderCode) {
        return res.status(400).json({
          success: false,
          message: 'orderCode is required',
        });
      }

      console.log('🚫 Cancelling PayOS Payment:', orderCode);

      const result = await this.paymentService.cancelPayOSPayment(orderCode, reason);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ PayOS Cancel Error:', error?.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hủy thanh toán PayOS',
        error: error?.message,
      });
    }
  }

  // GET /payment/payos/result - Trang kết quả thanh toán PayOS (redirect)
  @Get('payos/result')
  async payOSResult(@Query() query: any, @Res() res: Response) {
    console.log('🔄 PayOS Payment Result Query:', query);
    
    const { code, id, cancel, status, orderCode } = query;
    
    // Redirect về frontend với kết quả
    const frontendUrl = `http://localhost:3000/payment-result?gateway=payos&code=${code || ''}&id=${id || ''}&cancel=${cancel || ''}&status=${status || ''}&orderCode=${orderCode || ''}`;
    
    return res.redirect(frontendUrl);
  }

  // POST /payment/payos/verify-return - Xác minh và cập nhật trạng thái từ return URL
  @Post('payos/verify-return')
  async verifyPayOSReturn(
    @Body() body: { orderCode: string | number; orderNumber: string },
    @Res() res: Response,
  ) {
    try {
      const { orderCode, orderNumber } = body;

      if (!orderCode || !orderNumber) {
        return res.status(400).json({
          success: false,
          message: 'orderCode và orderNumber là bắt buộc',
        });
      }

      console.log('📊 Verifying PayOS Return:', { orderCode, orderNumber });

      const result = await this.paymentService.handlePayOSReturn(orderCode, orderNumber);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ PayOS Verify Return Error:', error?.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác minh thanh toán PayOS',
        error: error?.message,
      });
    }
  }

  // POST /payment/payos/confirm-webhook - Xác nhận webhook URL với PayOS
  @Post('payos/confirm-webhook')
  async confirmPayOSWebhook(@Body() body: { webhookUrl: string }, @Res() res: Response) {
    try {
      const { webhookUrl } = body;

      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          message: 'webhookUrl is required',
        });
      }

      console.log('🔗 Confirming PayOS Webhook URL:', webhookUrl);

      const result = await this.paymentService.confirmPayOSWebhook(webhookUrl);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ PayOS Confirm Webhook Error:', error?.message);
      return res.status(500).json({
        success: false,
        message: 'Lỗi xác nhận webhook PayOS',
        error: error?.message,
      });
    }
  }
}
