# Hướng dẫn tích hợp PayOS

## 1. Đăng ký tài khoản PayOS

1. Truy cập [https://payos.vn](https://payos.vn)
2. Đăng ký tài khoản merchant
3. Sau khi đăng ký thành công, vào trang quản trị để lấy thông tin:
   - **Client ID**
   - **API Key**
   - **Checksum Key**

## 2. Cấu hình Backend

### 2.1. Thiết lập biến môi trường

Tạo file `.env` trong thư mục `backend` với nội dung:

```env
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

### 2.2. Cấu hình Webhook

Trong trang quản trị PayOS, cấu hình Webhook URL:
```
https://your-domain.com/payment/payos/webhook
```

## 3. API Endpoints

### 3.1. Tạo thanh toán

**POST** `/payment/payos`

**Request Body:**
```json
{
  "orderCode": 123456789,
  "amount": 50000,
  "description": "Thanh toán đơn hàng #123",
  "items": [
    {
      "name": "Ốp lưng iPhone 15",
      "quantity": 1,
      "price": 50000
    }
  ],
  "cancelUrl": "http://localhost:3000/payment-cancel",
  "returnUrl": "http://localhost:3000/payment-result",
  "buyerName": "Nguyễn Văn A",
  "buyerEmail": "email@example.com",
  "buyerPhone": "0901234567",
  "buyerAddress": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bin": "970422",
    "accountNumber": "123456789",
    "accountName": "CONG TY GOATTECH",
    "amount": 50000,
    "description": "Thanh toán đơn hàng #123",
    "orderCode": 123456789,
    "currency": "VND",
    "paymentLinkId": "abc123xyz",
    "status": "PENDING",
    "checkoutUrl": "https://pay.payos.vn/web/abc123xyz",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### 3.2. Kiểm tra trạng thái thanh toán

**GET** `/payment/payos/check-status?orderCode=123456789`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123xyz",
    "orderCode": 123456789,
    "amount": 50000,
    "amountPaid": 50000,
    "amountRemaining": 0,
    "status": "PAID",
    "transactions": [...]
  }
}
```

### 3.3. Hủy thanh toán

**POST** `/payment/payos/cancel`

**Request Body:**
```json
{
  "orderCode": "123456789",
  "reason": "Khách hàng yêu cầu hủy"
}
```

### 3.4. Webhook (Nhận thông báo từ PayOS)

**POST** `/payment/payos/webhook`

PayOS sẽ gửi thông báo đến endpoint này khi:
- Thanh toán thành công
- Thanh toán bị hủy
- Thanh toán hết hạn

## 4. Tích hợp Frontend

### 4.1. Tạo thanh toán và redirect

```typescript
const createPayOSPayment = async (orderData: any) => {
  try {
    const response = await fetch('/api/payment/payos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderCode: orderData.id,
        amount: orderData.totalAmount,
        description: `Thanh toán đơn hàng #${orderData.id}`,
        items: orderData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        buyerName: orderData.customerName,
        buyerEmail: orderData.customerEmail,
        buyerPhone: orderData.customerPhone,
        returnUrl: `${window.location.origin}/payment-result`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
      }),
    });

    const result = await response.json();
    
    if (result.success && result.data.checkoutUrl) {
      // Redirect đến trang thanh toán PayOS
      window.location.href = result.data.checkoutUrl;
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

### 4.2. Hiển thị QR Code

```typescript
// Sử dụng qrCode từ response để hiển thị QR
<img src={result.data.qrCode} alt="QR Code thanh toán" />
```

### 4.3. Xử lý kết quả thanh toán

```typescript
// Trang payment-result
const PaymentResult = () => {
  const searchParams = useSearchParams();
  const gateway = searchParams.get('gateway');
  const code = searchParams.get('code');
  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');
  const cancel = searchParams.get('cancel');

  useEffect(() => {
    if (gateway === 'payos') {
      if (code === '00' && status === 'PAID') {
        // Thanh toán thành công
        console.log('Payment successful!');
      } else if (cancel === 'true') {
        // Thanh toán bị hủy
        console.log('Payment cancelled');
      } else {
        // Thanh toán thất bại
        console.log('Payment failed');
      }
    }
  }, [gateway, code, status, cancel]);

  return (
    // UI hiển thị kết quả
  );
};
```

## 5. Các trạng thái thanh toán PayOS

| Status | Mô tả |
|--------|-------|
| `PENDING` | Chờ thanh toán |
| `PAID` | Đã thanh toán |
| `PROCESSING` | Đang xử lý |
| `CANCELLED` | Đã hủy |
| `EXPIRED` | Hết hạn |

## 6. Lưu ý quan trọng

1. **Order Code**: Phải là số nguyên dương, unique cho mỗi giao dịch
2. **Amount**: Tối thiểu 2,000 VND, tối đa 500,000,000 VND
3. **Webhook**: Cần verify signature để đảm bảo an toàn
4. **HTTPS**: Webhook URL phải sử dụng HTTPS trong môi trường production
5. **Thời gian hết hạn**: Mặc định 15 phút, có thể tùy chỉnh qua `expiredAt`

## 7. Test Mode

Sử dụng thông tin test từ PayOS để kiểm tra:
- Môi trường test: Không trừ tiền thật
- Có thể mô phỏng các trạng thái thanh toán

## 8. So sánh với MoMo

| Tính năng | PayOS | MoMo |
|-----------|-------|------|
| QR Code | ✅ | ✅ |
| Chuyển khoản ngân hàng | ✅ | ❌ |
| Ví điện tử | ❌ | ✅ |
| Thẻ ATM/Credit | ✅ | ✅ |
| API đơn giản | ✅ | ⚡ |
| Phí giao dịch | Thấp | Trung bình |
