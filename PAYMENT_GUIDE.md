# 💳 Hệ Thống Thanh Toán MoMo - GoatTech

## 📋 Tổng Quan

Hệ thống tích hợp thanh toán MoMo hoàn chỉnh với các tính năng:
- ✅ Tạo thanh toán
- ✅ Nhận thông báo IPN (Instant Payment Notification)
- ✅ Kiểm tra trạng thái giao dịch
- ✅ Hoàn tiền
- ✅ Trang kết quả thanh toán

---

## 🚀 API Endpoints

### 1. **Tạo Thanh Toán**
```http
POST /payment/momo
```

**Request Body:**
```json
{
  "amount": "50000",
  "orderInfo": "Thanh toán đơn hàng GoatTech",
  "orderId": "ORDER123456", // Optional, tự động tạo nếu không có
  "redirectUrl": "http://localhost:3000/payment-result", // Optional
  "ipnUrl": "http://localhost:3001/payment/momo/ipn", // Optional
  "extraData": "" // Optional
}
```

**Response Success:**
```json
{
  "success": true,
  "data": {
    "partnerCode": "MOMO",
    "orderId": "MOMO1702345678901",
    "requestId": "MOMO1702345678901",
    "amount": "50000",
    "responseTime": 1702345678901,
    "message": "Successful.",
    "resultCode": 0,
    "payUrl": "https://test-payment.momo.vn/v2/gateway/pay?t=...",
    "deeplink": "momo://app?action=pay&...",
    "qrCodeUrl": "https://test-payment.momo.vn/v2/gateway/qr?t=...",
    "deeplinkMiniApp": "momo://..."
  }
}
```

---

### 2. **Kiểm Tra Trạng Thái**
```http
POST /payment/momo/check-status
```

**Request Body:**
```json
{
  "orderId": "MOMO1702345678901"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "partnerCode": "MOMO",
    "orderId": "MOMO1702345678901",
    "requestId": "MOMO1702345678901",
    "amount": "50000",
    "transId": 123456789,
    "resultCode": 0,
    "message": "Successful.",
    "payType": "qr"
  }
}
```

**Result Codes:**
- `0`: Giao dịch thành công
- `9000`: Giao dịch đang được xử lý
- Khác: Giao dịch thất bại

---

### 3. **Hoàn Tiền**
```http
POST /payment/momo/refund
```

**Request Body:**
```json
{
  "orderId": "MOMO1702345678901",
  "transId": "123456789",
  "amount": "50000",
  "description": "Hoàn tiền đơn hàng" // Optional
}
```

---

### 4. **IPN Callback (MoMo gọi tự động)**
```http
POST /payment/momo/ipn
```

MoMo sẽ gọi endpoint này để thông báo kết quả thanh toán.

---

### 5. **Trang Kết Quả (Redirect từ MoMo)**
```http
GET /payment/momo/result
```

Sau khi thanh toán, MoMo sẽ redirect user về trang này với các query parameters:
- `resultCode`: Mã kết quả
- `orderId`: Mã đơn hàng
- `message`: Thông báo
- `transId`: Mã giao dịch
- `amount`: Số tiền

---

## 🎨 Frontend

### Trang Test: `/payment-test`
Giao diện test đầy đủ với:
- Form tạo thanh toán
- Form kiểm tra trạng thái
- Hướng dẫn sử dụng

### Trang Kết Quả: `/payment-result`
Hiển thị kết quả thanh toán với:
- ✅ Icon trạng thái (Success/Pending/Failed)
- 📋 Chi tiết giao dịch
- 🔙 Nút quay về trang chủ
- 📦 Nút xem đơn hàng

---

## 🔧 Cấu Hình

### Backend (`payment.controller.ts`):
```typescript
private momoConfig: MomoConfig = {
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  partnerCode: 'MOMO',
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api',
};
```

### Frontend (`api-client.ts`):
```typescript
export const createMomoPayment = async (data: {
  amount: string | number;
  orderInfo?: string;
  orderId?: string;
  redirectUrl?: string;
  ipnUrl?: string;
  extraData?: string;
}) => { ... }
```

---

## 🧪 Test Flow

1. **Mở trang test**: `http://localhost:3000/payment-test`
2. **Nhập thông tin**:
   - Số tiền: `50000` (VND)
   - Mô tả: "Thanh toán đơn hàng GoatTech"
3. **Nhấn "Tạo Thanh Toán MoMo"**
4. **Sao chép `payUrl`** hoặc nhấn "Mở Link Thanh Toán"
5. **Trên trang MoMo test**:
   - Chọn phương thức thanh toán
   - Xác nhận thanh toán
6. **Redirect về trang kết quả**: `http://localhost:3000/payment-result`
7. **Kiểm tra trạng thái** bằng Order ID

---

## 📝 Frontend Usage

### Tạo thanh toán trong component:
```typescript
import { createMomoPayment } from '@/lib/api-client';

const handleCheckout = async () => {
  try {
    const result = await createMomoPayment({
      amount: totalAmount,
      orderInfo: `Đơn hàng #${orderId}`,
      orderId: orderId,
    });
    
    if (result.data?.payUrl) {
      // Chuyển hướng đến trang thanh toán MoMo
      window.location.href = result.data.payUrl;
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

### Kiểm tra trạng thái:
```typescript
import { checkMomoPaymentStatus } from '@/lib/api-client';

const checkStatus = async (orderId: string) => {
  const result = await checkMomoPaymentStatus(orderId);
  
  if (result.data?.resultCode === 0) {
    console.log('✅ Payment successful!');
  }
};
```

---

## 🔒 Security

### Signature Verification
Tất cả request đều được ký bằng HMAC SHA256:

```typescript
const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

const signature = crypto
  .createHmac('sha256', secretKey)
  .update(rawSignature)
  .digest('hex');
```

### IPN Verification
Server tự động verify signature từ MoMo trước khi xử lý.

---

## 📊 Result Codes

| Code | Ý nghĩa |
|------|---------|
| 0 | Giao dịch thành công |
| 9000 | Giao dịch đang được xử lý |
| 1006 | Giao dịch thất bại |
| 1001 | Giao dịch bị từ chối |
| 1002 | Giao dịch bị hủy |
| 1003 | Quá hạn thanh toán |
| 1004 | Số dư không đủ |

---

## 🎯 Next Steps

### TODO Backend:
- [ ] Lưu thông tin giao dịch vào database
- [ ] Cập nhật trạng thái đơn hàng khi nhận IPN
- [ ] Gửi email thông báo thanh toán
- [ ] Log chi tiết các giao dịch

### TODO Frontend:
- [ ] Thêm loading animation khi redirect
- [ ] Hiển thị QR code thanh toán
- [ ] Tích hợp vào trang checkout
- [ ] Lưu lịch sử giao dịch

---

## 🔗 Resources

- [MoMo API Documentation](https://developers.momo.vn/)
- [Test Environment](https://test-payment.momo.vn/)
- Backend: `backend/src/payment.controller.ts`
- Frontend Test: `fontend/src/app/payment-test/page.tsx`
- Result Page: `fontend/src/app/payment-result/page.tsx`
- API Client: `fontend/lib/api-client.ts`

---

## 🆘 Support

Có vấn đề? Kiểm tra:
1. Backend đã chạy: `http://localhost:3001`
2. Frontend đã chạy: `http://localhost:3000`
3. Xem console log để debug
4. Test endpoint bằng Postman/Thunder Client

---

**Developed with ❤️ by GoatTech Team**
