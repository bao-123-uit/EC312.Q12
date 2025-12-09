# CẤU TRÚC DỰ ÁN - EC312.Q12

## 📁 BACKEND (NestJS)

```
backend/src/
├── main.ts                      # Entry point, CORS config
├── app.module.ts                # Root module, import all modules
├── app.controller.ts            # Root controller (/)
├── app.service.ts               # Root service
├── supabase.service.ts          # Database service (shared)
├── payment.controller.ts        # Payment endpoints
│
├── auth/                        # Authentication Module
│   ├── auth.module.ts          # Auth module definition
│   ├── auth.controller.ts      # Routes: POST /auth/register, /auth/login
│   └── auth.service.ts         # Business logic: register, login
│
├── product/                     # Product Module
│   ├── product.module.ts       # Product module definition
│   ├── product.controller.ts   # Routes: GET /products, /products/:id
│   └── product.service.ts      # Business logic: getProducts, getProductById
│
├── order/                       # Order Module
│   ├── order.module.ts         # Order module definition
│   ├── order.controller.ts     # Routes: GET /orders, /orders/:id
│   └── order.service.ts        # Business logic: getOrders, getOrderById
│
├── category/                    # Category Module
│   ├── category.module.ts      # Category module definition
│   ├── category.controller.ts  # Routes: GET /categories/*
│   └── category.service.ts     # Business logic: category operations
│
└── customer/                    # Customer Module
    ├── customer.module.ts      # Customer module definition
    ├── customer.controller.ts  # Routes: GET /customers
    └── customer.service.ts     # Business logic: getCustomers
```

## 📁 FRONTEND (Next.js)

```
fontend/
├── lib/
│   ├── api-client.ts           # (Legacy - có thể xóa)
│   └── api/                    # API Client Layer (MỚI)
│       ├── index.ts            # Export all API functions
│       ├── auth.api.ts         # Authentication APIs
│       ├── product.api.ts      # Product APIs
│       ├── category.api.ts     # Category APIs
│       ├── order.api.ts        # Order APIs
│       └── customer.api.ts     # Customer APIs
│
└── src/app/                    # Pages
    ├── page.tsx                # Homepage (/)
    ├── layout.tsx              # Root layout
    │
    ├── register/               # Registration Module
    │   └── page.tsx            # Uses: auth.api.ts
    │
    ├── login/                  # Login Module
    │   └── page.tsx            # Uses: auth.api.ts
    │
    ├── shop/                   # Shop Module
    │   └── page.tsx            # Uses: product.api.ts
    │
    ├── product/                # Product Detail Module
    │   └── [id]/
    │       └── page.tsx        # Uses: product.api.ts
    │
    ├── categories/             # Categories Module
    │   └── page.tsx            # Uses: category.api.ts
    │
    ├── admin/                  # Admin Module
    │   └── page.tsx            # Uses: all APIs
    │
    ├── account/                # Account Module
    │   └── page.tsx
    │
    ├── about/                  # Static Pages
    ├── contact/
    └── promotions/
```

## 🔄 LUỒNG HOẠT ĐỘNG

### Backend Flow:
```
Request → Controller → Service → SupabaseService → Database
```

### Frontend Flow:
```
Component → API Client (lib/api/*.ts) → Backend API → Response
```

## 📝 VÍ DỤ SỬ DỤNG

### Backend - Thêm module mới:
```typescript
// 1. Tạo folder: src/review/
// 2. Tạo: review.controller.ts, review.service.ts, review.module.ts
// 3. Import vào app.module.ts

import { ReviewModule } from './review/review.module';

@Module({
  imports: [..., ReviewModule],
})
```

### Frontend - Gọi API:
```typescript
// Cũ (không khuyến khích):
import { fetchProducts } from '@/lib/api-client';

// Mới (tốt hơn):
import { fetchProducts } from '@/lib/api';
// hoặc
import { fetchProducts } from '@/lib/api/product.api';
```

## ✅ LỢI ÍCH CỦA CẤU TRÚC MỚI

1. **Backend**:
   - ✅ Module hóa rõ ràng (mỗi chức năng 1 folder)
   - ✅ Controller chỉ định nghĩa routes
   - ✅ Service chứa logic nghiệp vụ
   - ✅ Dễ mở rộng (thêm module mới không ảnh hưởng code cũ)
   - ✅ Dễ test từng module riêng

2. **Frontend**:
   - ✅ API client tách biệt theo chức năng
   - ✅ Import chính xác: `import { fetchProducts } from '@/lib/api'`
   - ✅ Dễ tìm kiếm: muốn gọi API product → mở product.api.ts
   - ✅ Tránh file api-client.ts quá dài

## 🚀 API ENDPOINTS

### Authentication
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập

### Products
- `GET /products` - Lấy danh sách
- `GET /products/:id` - Chi tiết sản phẩm

### Categories
- `GET /categories` - Tất cả danh mục
- `GET /categories/root` - Danh mục gốc
- `GET /categories/:id` - Chi tiết
- `GET /categories/:id/children` - Con

### Orders
- `GET /orders` - Danh sách đơn hàng
- `GET /orders/:id` - Chi tiết đơn hàng

### Customers
- `GET /customers` - Danh sách khách hàng
