import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase.service';
import { PaymentService } from '../payment/payment.service';
import * as nodemailer from 'nodemailer';

export interface SendGiftDto {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientAddress?: string;
  productId: number;
  quantity?: number;
}

export interface VerifyGiftDto {
  giftId: string;
  verificationCode: string;
}

export interface ClaimGiftDto {
  giftId: string;
  recipientAddress: string;
  recipientPhone: string;
}

export interface CreateGiftPaymentDto {
  senderName: string;
  senderEmail: string;
  senderMessage?: string;
  senderId?: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  productId: number;
  quantity?: number;
}

@Injectable()
export class GiftService {
  private transporter: nodemailer.Transporter;

  constructor(
    private supabaseService: SupabaseService,
    private paymentService: PaymentService,
  ) {
    // Cấu hình email transporter
    // Sử dụng Gmail SMTP - Bạn cần tạo App Password trong Google Account
    console.log('📧 Email config:', {
      user: process.env.EMAIL_USER || 'NOT SET',
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
    });
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });
  }

  // Tạo mã xác nhận 6 số
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Tạo mã đơn hàng unique
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GTMJV${timestamp}${random}`;
  }

  // ================== PAYOS GIFT PAYMENT ==================

  /**
   * Tạo thanh toán PayOS cho quà tặng
   * Lưu thông tin gift tạm thời với status 'pending_payment'
   */
  async createGiftPayment(dto: CreateGiftPaymentDto) {
    // Kiểm tra sản phẩm tồn tại
    const { data: product, error: productError } = await this.supabaseService.getProductById(dto.productId);

    if (productError || !product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    const amount = product.sale_price || product.price;
    const orderCode = Date.now(); // Unique order code
    const quantity = dto.quantity || 1;
    const totalAmount = amount * quantity;

    // Tạo mã xác nhận trước (sẽ dùng sau khi thanh toán)
    const verificationCode = this.generateVerificationCode();

    // Lưu gift với status 'pending_payment'
    const { data: gift, error: giftError } = await this.supabaseService.createGift({
      sender_id: dto.senderId || undefined,
      sender_name: dto.senderName,
      sender_email: dto.senderEmail,
      sender_message: dto.senderMessage || '',
      recipient_name: dto.recipientName,
      recipient_email: dto.recipientEmail,
      recipient_phone: dto.recipientPhone || '',
      recipient_address: '',
      product_id: dto.productId,
      quantity: quantity,
      verification_code: verificationCode,
      status: 'pending_payment', // Chờ thanh toán
      payment_order_code: String(orderCode), // Lưu orderCode để xác minh sau
    });

    if (giftError) {
      console.error('Gift insert error:', giftError);
      throw new BadRequestException('Không thể tạo quà tặng: ' + giftError.message);
    }

    // Tạo description ngắn gọn (max 25 ký tự cho PayOS)
    const description = `QT ${gift.gift_id.slice(0, 20)}`;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const cancelUrl = `${frontendUrl}/gift/send?productId=${dto.productId}&cancelled=true`;
    const returnUrl = `${frontendUrl}/gift/payment-result?giftId=${gift.gift_id}&orderCode=${orderCode}`;

    // Tạo thanh toán PayOS
    const paymentResult = await this.paymentService.createPayOSPayment({
      orderCode,
      amount: totalAmount,
      description,
      items: [{
        name: product.product_name.slice(0, 25), // Max 25 chars
        quantity: quantity,
        price: amount,
      }],
      cancelUrl,
      returnUrl,
      buyerName: dto.senderName,
      buyerEmail: dto.senderEmail,
      buyerPhone: dto.recipientPhone,
    });

    return {
      success: true,
      message: 'Vui lòng thanh toán để hoàn tất gửi quà',
      giftId: gift.gift_id,
      orderCode,
      amount: totalAmount,
      checkoutUrl: paymentResult.data?.checkoutUrl,
      paymentData: paymentResult.data,
    };
  }

  /**
   * Xác minh thanh toán PayOS và gửi email
   * Gọi sau khi user thanh toán xong và redirect về
   */
  async verifyGiftPayment(giftId: string, orderCode: string | number) {
    // Lấy thông tin gift
    const { data: gift, error: giftError } = await this.supabaseService.getGiftById(giftId);

    if (giftError || !gift) {
      throw new NotFoundException('Không tìm thấy quà tặng');
    }

    if (gift.status !== 'pending_payment') {
      // Đã xử lý rồi
      return {
        success: true,
        message: 'Quà tặng đã được xử lý',
        giftId: gift.gift_id,
        status: gift.status,
      };
    }

    // Kiểm tra orderCode có khớp không
    if (gift.payment_order_code !== String(orderCode)) {
      throw new BadRequestException('Mã thanh toán không khớp');
    }

    // Xác minh thanh toán với PayOS
    const paymentInfo = await this.paymentService.getPayOSPaymentInfo(orderCode);

    if (!paymentInfo.success || paymentInfo.data?.status !== 'PAID') {
      // Thanh toán chưa hoàn thành
      return {
        success: false,
        message: 'Thanh toán chưa hoàn thành',
        status: paymentInfo.data?.status,
      };
    }

    // Thanh toán thành công -> Tạo đơn hàng và gửi email
    
    // Lấy thông tin sản phẩm
    const { data: product } = await this.supabaseService.getProductById(gift.product_id);
    const productPrice = product?.sale_price || product?.price || 0;
    const totalAmount = productPrice * gift.quantity;

    // TẠO ĐƠN HÀNG cho quà tặng
    let orderId: number | null = null;
    let orderNumber: string | null = null;
    try {
      // Tạo mã đơn hàng
      orderNumber = this.generateOrderNumber();
      
      const { data: order, error: orderError } = await this.supabaseService.createOrder({
        customer_id: gift.sender_id || null,
        order_number: orderNumber,
        subtotal: totalAmount,
        total_amount: totalAmount,
        discount_amount: 0,
        shipping_fee: 0,
        order_status: 'success', // Đã thanh toán xong
        payment_status: 'paid',
        payment_method: 'payos',
        shipping_full_name: gift.recipient_name,
        shipping_phone: gift.recipient_phone || '',
        shipping_address: gift.recipient_address || 'Chờ người nhận cung cấp',
        customer_note: `🎁 Quà tặng từ ${gift.sender_name} (${gift.sender_email}). Lời nhắn: "${gift.sender_message || 'Không có'}"`,
      });

      console.log('📦 Create order result:', { order, orderError });

      if (order && !orderError) {
        const orderData = order as any;
        orderId = Array.isArray(orderData) ? orderData[0]?.order_id : orderData.order_id;
        orderNumber = Array.isArray(orderData) ? orderData[0]?.order_number : orderData.order_number;

        // Thêm sản phẩm vào đơn hàng
        await this.supabaseService.createOrderItem({
          order_id: orderId,
          product_id: gift.product_id,
          product_name: product?.product_name || 'Quà tặng',
          sku: product?.sku || `GIFT-${gift.gift_id.slice(0, 8)}`,
          quantity: gift.quantity,
          unit_price: productPrice,
          discount_amount: 0,
          total_price: totalAmount,
        });

        console.log('✅ Order created for gift:', orderNumber);
      }
    } catch (orderErr) {
      console.error('❌ Error creating order for gift:', orderErr);
    }

    // Cập nhật gift status
    await this.supabaseService.updateGiftStatus(giftId, 'sent', {
      payment_status: 'paid',
      payment_date: new Date().toISOString(),
    });

    // Lấy ảnh sản phẩm
    const productImage = product?.image_url || 
      product?.product_images?.find((img: any) => img.is_primary)?.image_url ||
      product?.product_images?.[0]?.image_url ||
      'https://via.placeholder.com/200';

    // Gửi email cho người nhận
    try {
      console.log('📧 Sending gift email after payment to:', gift.recipient_email);
      await this.sendGiftNotificationEmail({
        recipientEmail: gift.recipient_email,
        recipientName: gift.recipient_name,
        senderName: gift.sender_name,
        senderMessage: gift.sender_message || '',
        productName: product?.product_name || 'Quà tặng',
        productImage: productImage,
        productPrice: product?.sale_price || product?.price || 0,
        giftId: gift.gift_id,
        verificationCode: gift.verification_code,
      });

      // Lưu lịch sử email
      await this.supabaseService.createGiftEmail({
        gift_id: gift.gift_id,
        email_type: 'notification',
        sent_to: gift.recipient_email,
        status: 'sent',
      });

      console.log('✅ Gift email sent successfully!');
    } catch (emailError) {
      console.error('❌ Email send error:', emailError);
    }

    return {
      success: true,
      message: 'Thanh toán thành công! Email đã được gửi đến người nhận.',
      giftId: gift.gift_id,
      orderNumber: orderNumber,
      orderId: orderId,
      status: 'sent',
    };
  }

  // Gửi quà tặng (cũ - giữ lại cho backward compatibility)
  async sendGift(dto: SendGiftDto) {
    // Kiểm tra sản phẩm tồn tại
    const { data: product, error: productError } = await this.supabaseService.getProductById(dto.productId);

    if (productError || !product) {
      throw new NotFoundException('Sản phẩm không tồn tại');
    }

    // Tạo mã xác nhận
    const verificationCode = this.generateVerificationCode();

    // Lưu thông tin quà tặng
    const { data: gift, error: giftError } = await this.supabaseService.createGift({
      sender_id: dto.senderId || undefined,
      sender_name: dto.senderName,
      sender_email: dto.senderEmail,
      sender_message: dto.senderMessage || '',
      recipient_name: dto.recipientName,
      recipient_email: dto.recipientEmail,
      recipient_phone: dto.recipientPhone || '',
      recipient_address: dto.recipientAddress || '',
      product_id: dto.productId,
      quantity: dto.quantity || 1,
      verification_code: verificationCode,
    });

    if (giftError) {
      console.error('Gift insert error:', giftError);
      throw new BadRequestException('Không thể tạo quà tặng: ' + giftError.message);
    }

    // Lấy ảnh sản phẩm
    const productImage = product.image_url || 
      product.product_images?.find((img: any) => img.is_primary)?.image_url ||
      product.product_images?.[0]?.image_url ||
      'https://via.placeholder.com/200';

    // Gửi email cho người nhận
    try {
      console.log('📧 Sending email to:', dto.recipientEmail);
      await this.sendGiftNotificationEmail({
        recipientEmail: dto.recipientEmail,
        recipientName: dto.recipientName,
        senderName: dto.senderName,
        senderMessage: dto.senderMessage || '',
        productName: product.product_name,
        productImage: productImage,
        productPrice: product.sale_price || product.price,
        giftId: gift.gift_id,
        verificationCode: verificationCode,
      });

      // Lưu lịch sử email
      await this.supabaseService.createGiftEmail({
        gift_id: gift.gift_id,
        email_type: 'notification',
        sent_to: dto.recipientEmail,
        status: 'sent',
      });

    } catch (emailError) {
      console.error('❌ Email send error:', emailError);
      console.error('❌ Email error message:', (emailError as any).message);
      // Vẫn return success vì gift đã được tạo
    }

    return {
      success: true,
      message: 'Quà tặng đã được gửi! Email xác nhận đã được gửi đến người nhận.',
      giftId: gift.gift_id,
    };
  }

  // Gửi email thông báo quà tặng
  private async sendGiftNotificationEmail(data: {
    recipientEmail: string;
    recipientName: string;
    senderName: string;
    senderMessage: string;
    productName: string;
    productImage: string;
    productPrice: number;
    giftId: string;
    verificationCode: string;
  }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const claimUrl = `${frontendUrl}/gift/claim/${data.giftId}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
        .gift-icon { font-size: 60px; margin-bottom: 10px; }
        .content { padding: 30px; }
        .message-box { background: #fdf2f8; border-left: 4px solid #ec4899; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .product-card { display: flex; gap: 20px; background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .product-image { width: 120px; height: 120px; object-fit: cover; border-radius: 8px; }
        .product-info h3 { margin: 0 0 10px; color: #1f2937; }
        .product-price { color: #ec4899; font-size: 24px; font-weight: bold; }
        .verification-box { background: #fef3c7; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .verification-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #d97706; margin: 10px 0; }
        .claim-btn { display: inline-block; background: linear-gradient(135deg, #ec4899, #f43f5e); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px; margin: 20px 0; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px; }
        .footer a { color: #ec4899; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="gift-icon">🎁</div>
          <h1>Bạn Nhận Được Quà Tặng!</h1>
          <p>Từ ${data.senderName}</p>
        </div>
        
        <div class="content">
          <p style="font-size: 18px; color: #374151;">
            Xin chào <strong>${data.recipientName}</strong>,
          </p>
          
          <p style="color: #6b7280; line-height: 1.6;">
            <strong>${data.senderName}</strong> đã gửi tặng bạn một món quà đặc biệt từ GoatTech! 🎉
          </p>
          
          ${data.senderMessage ? `
          <div class="message-box">
            <p style="margin: 0; color: #831843; font-style: italic;">
              "${data.senderMessage}"
            </p>
            <p style="margin: 10px 0 0; color: #9d174d; font-size: 14px;">
              — ${data.senderName}
            </p>
          </div>
          ` : ''}
          
          <h2 style="color: #1f2937;">🎁 Quà tặng của bạn:</h2>
          
          <div class="product-card">
            <img src="${data.productImage}" alt="${data.productName}" class="product-image">
            <div class="product-info">
              <h3>${data.productName}</h3>
              <p class="product-price">${data.productPrice.toLocaleString('vi-VN')}₫</p>
            </div>
          </div>
          
          <div class="verification-box">
            <p style="margin: 0; color: #92400e;">🔐 Mã xác nhận của bạn:</p>
            <div class="verification-code">${data.verificationCode}</div>
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              Sử dụng mã này để nhận quà
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${claimUrl}" class="claim-btn">
              🎁 Nhận Quà Ngay
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            Hoặc truy cập: <a href="${claimUrl}" style="color: #ec4899;">${claimUrl}</a>
          </p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              ⏰ <strong>Lưu ý:</strong> Quà tặng có hiệu lực trong 7 ngày. 
              Vui lòng nhận quà trước khi hết hạn!
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2025 GoatTech - Phụ kiện điện thoại cao cấp</p>
          <p>
            Email này được gửi tự động. Nếu bạn không yêu cầu, vui lòng bỏ qua.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    console.log('📧 Attempting to send email...');
    console.log('📧 From:', `"GoatTech Gift 🎁" <${process.env.EMAIL_USER || 'noreply@goattech.vn'}>`);
    console.log('📧 To:', data.recipientEmail);
    
    const result = await this.transporter.sendMail({
      from: `"GoatTech Gift 🎁" <${process.env.EMAIL_USER || 'noreply@goattech.vn'}>`,
      to: data.recipientEmail,
      subject: `🎁 ${data.senderName} đã gửi tặng bạn một món quà!`,
      html: htmlContent,
    });
    
    console.log('✅ Email sent successfully!', result);
  }

  // Xác nhận mã để nhận quà
  async verifyGift(dto: VerifyGiftDto) {
    const { data: gift, error } = await this.supabaseService.getGiftById(dto.giftId);

    if (error || !gift) {
      throw new NotFoundException('Không tìm thấy quà tặng');
    }

    if (gift.status === 'claimed') {
      throw new BadRequestException('Quà tặng đã được nhận');
    }

    if (gift.status === 'expired' || new Date(gift.expires_at) < new Date()) {
      throw new BadRequestException('Quà tặng đã hết hạn');
    }

    if (gift.verification_code !== dto.verificationCode) {
      throw new BadRequestException('Mã xác nhận không đúng');
    }

    // Cập nhật trạng thái
    await this.supabaseService.updateGiftStatus(dto.giftId, 'verified');

    return {
      success: true,
      message: 'Xác nhận thành công!',
      gift: {
        ...gift,
        verification_code: undefined, // Không trả về mã
      },
    };
  }

  // Nhận quà (sau khi đã xác nhận)
  async claimGift(dto: ClaimGiftDto) {
    const { data: gift, error } = await this.supabaseService.getGiftById(dto.giftId);

    if (error || !gift) {
      throw new NotFoundException('Không tìm thấy quà tặng');
    }

    if (gift.status === 'claimed') {
      throw new BadRequestException('Quà tặng đã được nhận');
    }

    if (gift.status !== 'verified') {
      throw new BadRequestException('Vui lòng xác nhận mã trước khi nhận quà');
    }

    // Tạo order_number unique
    const orderNumber = `GIFT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Tạo đơn hàng cho quà tặng - đúng cấu trúc bảng orders
    const { data: order, error: orderError } = await this.supabaseService.createOrder({
      order_number: orderNumber,
      customer_id: gift.sender_id || null, // UUID hoặc null cho guest
      order_status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'gift',
      subtotal: 0,
      total_amount: 0, // Free gift
      shipping_fee: 0,
      discount_amount: 0,
      shipping_full_name: gift.recipient_name,
      shipping_phone: dto.recipientPhone,
      shipping_address: dto.recipientAddress,
      customer_note: `Quà tặng từ ${gift.sender_name} (${gift.sender_email})`,
    });

    if (orderError || !order) {
      console.error('Create order error:', orderError);
      throw new BadRequestException(orderError?.message || 'Không thể tạo đơn hàng');
    }

    const orderData = order as any;
    const orderId = Array.isArray(orderData) ? orderData[0]?.order_id : orderData.order_id;

    // Thêm sản phẩm vào đơn hàng - đúng cấu trúc bảng order_items
    await this.supabaseService.createOrderItem({
      order_id: orderId,
      product_id: gift.product_id,
      product_name: gift.products?.product_name || 'Quà tặng',
      sku: gift.products?.sku || `GIFT-${gift.product_id}`,
      quantity: gift.quantity || 1,
      unit_price: 0,
      discount_amount: 0,
      total_price: 0, // Free
    });

    // Cập nhật trạng thái gift
    await this.supabaseService.updateGiftStatus(dto.giftId, 'claimed', {
      recipient_address: dto.recipientAddress,
      recipient_phone: dto.recipientPhone,
    });

    // Gửi email xác nhận cho người nhận
    try {
      await this.sendClaimConfirmationEmail({
        recipientEmail: gift.recipient_email,
        recipientName: gift.recipient_name,
        productName: gift.products.product_name,
        orderId: orderId,
      });
    } catch (e) {
      console.error('Failed to send confirmation email:', e);
    }

    return {
      success: true,
      message: 'Nhận quà thành công! Đơn hàng đã được tạo.',
      orderId: orderId,
    };
  }

  // Email xác nhận đã nhận quà
  private async sendClaimConfirmationEmail(data: {
    recipientEmail: string;
    recipientName: string;
    productName: string;
    orderId: number;
  }) {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 30px; }
        .order-box { background: #f0fdf4; padding: 20px; border-radius: 12px; text-align: center; }
        .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Nhận Quà Thành Công!</h1>
        </div>
        <div class="content">
          <p>Xin chào <strong>${data.recipientName}</strong>,</p>
          <p>Bạn đã nhận thành công quà tặng:</p>
          <div class="order-box">
            <h3>${data.productName}</h3>
            <p>Mã đơn hàng: <strong>#${data.orderId}</strong></p>
          </div>
          <p>Chúng tôi sẽ sớm giao hàng đến địa chỉ của bạn!</p>
        </div>
        <div class="footer">
          <p>© 2025 GoatTech</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await this.transporter.sendMail({
      from: `"GoatTech" <${process.env.EMAIL_USER}>`,
      to: data.recipientEmail,
      subject: `✅ Bạn đã nhận quà thành công - Đơn hàng #${data.orderId}`,
      html: htmlContent,
    });
  }

  // Lấy thông tin quà tặng (public - không cần auth)
  async getGiftInfo(giftId: string) {
    const { data: gift, error } = await this.supabaseService.getGiftPublicInfo(giftId);

    if (error || !gift) {
      throw new NotFoundException('Không tìm thấy quà tặng');
    }

    return gift;
  }

  // Lấy danh sách quà đã gửi (cho user)
  async getSentGifts(userId: string) {
    const { data, error } = await this.supabaseService.getSentGifts(userId);

    if (error) {
      throw new BadRequestException('Không thể lấy danh sách quà tặng');
    }

    return data;
  }

  // Lấy danh sách quà đã nhận (theo email)
  async getReceivedGifts(email: string) {
    const { data, error } = await this.supabaseService.getReceivedGifts(email);

    if (error) {
      throw new BadRequestException('Không thể lấy danh sách quà tặng');
    }

    return data;
  }
}
