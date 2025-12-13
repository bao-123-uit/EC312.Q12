import { Controller, Post, Body, Res, Get, Query } from '@nestjs/common';
import axios from 'axios';
import type { Response } from 'express';
import * as crypto from 'crypto';

interface MomoConfig {
  accessKey: string;
  secretKey: string;
  partnerCode: string;
  endpoint: string;
}

@Controller('payment')
export class PaymentController {
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
      const requestType = 'payWithMethod';
      const amount = String(body.amount || '50000');
      const orderId = body.orderId || `${partnerCode}${Date.now()}`;
      const requestId = orderId;
      const extraData = body.extraData || '';
      const autoCapture = true;
      const lang = 'vi';

      // Build raw signature theo thứ tự alphabet
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      
      const signature = this.createSignature(rawSignature);

      console.log('📝 MoMo Payment Request:');
      console.log('- Order ID:', orderId);
      console.log('- Amount:', amount);
      console.log('- Raw Signature:', rawSignature);

      // Build request body
      const requestBody = {
        partnerCode,
        partnerName: 'GoatTech Store',
        storeId: 'GoatTechStore',
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType,
        autoCapture,
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
}
