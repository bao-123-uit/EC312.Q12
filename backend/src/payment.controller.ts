import { Controller, Post, Body, Res } from '@nestjs/common';
import axios from 'axios';
import type { Response } from 'express';
import * as crypto from 'crypto';

@Controller('payment')
export class PaymentController {
  @Post('momo')
  async createMomoPayment(@Body() body: any, @Res() res: Response) {
    try {
      const accessKey = 'F8BBA842ECF85';
      const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
      const orderInfo = body.orderInfo || 'pay with MoMo';
      const partnerCode = 'MOMO';
      const redirectUrl = body.redirectUrl || 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
      const ipnUrl = body.ipnUrl || 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b';
      const requestType = 'payWithMethod';
      const amount = body.amount || '50000';
      const orderId = partnerCode + new Date().getTime();
      const requestId = orderId;
      const extraData = body.extraData || '';
      const autoCapture = true;
      const lang = 'vi';

      // Build raw signature
      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      
      console.log('--------------------RAW SIGNATURE----------------');
      console.log(rawSignature);

      // Create signature
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

      console.log('--------------------SIGNATURE----------------');
      console.log(signature);

      // Build request body
      const requestBody = {
        partnerCode,
        partnerName: 'Test',
        storeId: 'MomoTestStore',
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
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error',
        error: error?.message,
      });
    }
  }
}
