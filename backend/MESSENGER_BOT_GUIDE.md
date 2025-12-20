# 🤖 Facebook Messenger Bot - Hướng dẫn cài đặt

## 📋 Tổng quan

Facebook Messenger Bot tự động nhận đơn hàng cho cửa hàng bán ốp điện thoại và phụ kiện.

### ✨ Tính năng chính:
- ✅ Webhook nhận tin nhắn từ Facebook Messenger
- ✅ Bot tự động trả lời khách hàng
- ✅ Hiển thị sản phẩm dưới dạng Quick Reply
- ✅ Flow đặt hàng tự động 6 bước
- ✅ Xác nhận đơn hàng
- ✅ Lưu đơn hàng vào Supabase
- ✅ Gửi webhook đến hệ thống quản lý (retry 3 lần)

---

## 🚀 Cài đặt

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install axios
```

### Bước 2: Tạo bảng database

Chạy SQL script trong Supabase:
```bash
# Copy nội dung file sql/create_messenger_orders.sql
# Vào Supabase Dashboard > SQL Editor > Paste và Run
```

### Bước 3: Cấu hình biến môi trường

Copy file `.env.messenger.example` và thêm vào `.env`:

```env
# Facebook Messenger
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token
FACEBOOK_VERIFY_TOKEN=your_custom_verify_token
WEBHOOK_URL=https://your-website.com/api/orders
```

### Bước 4: Chạy server

```bash
npm run start:dev
```

---

## ⚙️ Cấu hình Facebook

### 1. Tạo Facebook App

1. Vào [Facebook Developers](https://developers.facebook.com)
2. Click **"Create App"**
3. Chọn **"Business"** → **"Messenger"**
4. Nhập tên App và tạo

### 2. Liên kết Facebook Page

1. Vào **App Dashboard** → **Messenger** → **Settings**
2. Trong phần **Access Tokens**, click **"Add or Remove Pages"**
3. Chọn Page của bạn và cấp quyền
4. Copy **Page Access Token** vào file `.env`

### 3. Cấu hình Webhook

1. Vào **Messenger** → **Settings** → **Webhooks**
2. Click **"Add Callback URL"**
3. Điền thông tin:
   - **Callback URL**: `https://your-domain.com/messenger/webhook`
   - **Verify Token**: Giá trị của `FACEBOOK_VERIFY_TOKEN` trong `.env`
4. Chọn **Subscription Fields**:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_optins`
5. Click **"Verify and Save"**

### 4. Setup Persistent Menu (Optional)

Gọi API để tạo menu cố định:

```bash
curl -X POST "https://graph.facebook.com/v18.0/me/messenger_profile?access_token=YOUR_PAGE_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "persistent_menu": [
    {
      "locale": "default",
      "composer_input_disabled": false,
      "call_to_actions": [
        {
          "type": "postback",
          "title": "📱 Xem sản phẩm",
          "payload": "VIEW_PRODUCTS"
        },
        {
          "type": "postback",
          "title": "📦 Đơn hàng của tôi",
          "payload": "VIEW_ORDERS"
        },
        {
          "type": "postback",
          "title": "💬 Hỗ trợ",
          "payload": "CONTACT_SUPPORT"
        }
      ]
    }
  ]
}'
```

### 5. Setup Get Started Button

```bash
curl -X POST "https://graph.facebook.com/v18.0/me/messenger_profile?access_token=YOUR_PAGE_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "get_started": {
    "payload": "GET_STARTED"
  }
}'
```

---

## 📡 API Endpoints

### Webhook Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/messenger/webhook` | Xác minh webhook từ Facebook |
| `POST` | `/messenger/webhook` | Nhận sự kiện từ Facebook |

### Admin API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/messenger/products` | Lấy danh sách sản phẩm |
| `GET` | `/messenger/orders` | Lấy tất cả đơn hàng |
| `GET` | `/messenger/orders/:id` | Lấy chi tiết đơn hàng |
| `PUT` | `/messenger/orders/:id/status` | Cập nhật trạng thái đơn |
| `GET` | `/messenger/health` | Kiểm tra trạng thái service |

### Ví dụ API

**Lấy danh sách đơn hàng:**
```bash
GET http://localhost:3001/messenger/orders?limit=10&offset=0
```

**Cập nhật trạng thái đơn:**
```bash
PUT http://localhost:3001/messenger/orders/123/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

---

## 🔄 Flow đặt hàng

```
┌─────────────────┐
│  Khách nhắn tin │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Bot chào + Menu │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Chọn sản phẩm   │ ← Quick Reply
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Chọn màu sắc    │ ← Quick Reply
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Nhập số lượng   │ ← Text input (1-99)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Nhập họ tên     │ ← Text input
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Nhập SĐT        │ ← Text input (validate)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Nhập địa chỉ    │ ← Text input
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Xác nhận đơn    │ ← Quick Reply (Có/Không)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│ Lưu DB│ │ Hủy   │
│+ Send │ │ đơn   │
│Webhook│ └───────┘
└───────┘
```

---

## 📦 Cấu trúc thư mục

```
backend/src/messenger/
├── messenger.module.ts      # Module config
├── messenger.controller.ts  # API endpoints
├── messenger.service.ts     # Business logic
└── messenger.types.ts       # TypeScript types

backend/sql/
└── create_messenger_orders.sql  # Database schema
```

---

## 🔧 Debug & Testing

### Test Webhook locally với ngrok

```bash
# Cài ngrok
npm install -g ngrok

# Chạy backend
npm run start:dev

# Mở tunnel
ngrok http 3001

# Copy URL https://xxx.ngrok.io/messenger/webhook
# Dán vào Facebook Webhook settings
```

### Test bot

1. Mở Facebook Page của bạn
2. Click **"Send Message"**
3. Gõ "hi" hoặc "menu"
4. Làm theo hướng dẫn của bot

### Xem logs

```bash
# Logs sẽ hiện trong terminal khi chạy
npm run start:dev

# Xem logs chi tiết
DEBUG=* npm run start:dev
```

---

## 🛡️ Bảo mật

### 1. Verify Request Signature (Recommended)

Thêm middleware verify signature từ Facebook:

```typescript
// Trong messenger.controller.ts
import * as crypto from 'crypto';

function verifySignature(req: Request, appSecret: string): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  const payload = JSON.stringify(req.body);
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', appSecret)
          .update(payload)
          .digest('hex');
  return signature === expectedSignature;
}
```

### 2. Rate Limiting

Cân nhắc thêm rate limiting để tránh spam.

### 3. Input Validation

Service đã có validation cho:
- Số điện thoại (regex Việt Nam)
- Số lượng (1-99)
- Tên (2-100 ký tự)
- Địa chỉ (10-500 ký tự)

---

## 📊 Database Schema

```sql
CREATE TABLE messenger_orders (
    id UUID PRIMARY KEY,
    facebook_user_id VARCHAR(255),
    customer_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    product_name VARCHAR(255),
    product_price DECIMAL(12, 0),
    quantity INTEGER,
    color VARCHAR(100),
    total_price DECIMAL(12, 0),
    notes TEXT,
    status VARCHAR(50), -- pending, confirmed, processing, shipping, delivered, cancelled
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## ❓ FAQ

**Q: Webhook không verify được?**
- Kiểm tra `FACEBOOK_VERIFY_TOKEN` trong `.env` khớp với Facebook settings
- Đảm bảo server có HTTPS
- Check logs để xem error

**Q: Bot không trả lời tin nhắn?**
- Kiểm tra `FACEBOOK_PAGE_ACCESS_TOKEN` còn hiệu lực
- Check logs xem có nhận được webhook không
- Đảm bảo Page đã subscribe webhook

**Q: Đơn hàng không lưu được?**
- Kiểm tra kết nối Supabase
- Đảm bảo đã chạy SQL tạo bảng
- Check logs error

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs trong terminal
2. Facebook App Dashboard > Webhooks > Logs
3. Supabase Dashboard > Logs

---

## 📝 License

MIT License
