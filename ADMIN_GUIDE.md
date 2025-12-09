# HƯỚNG DẪN ĐĂNG NHẬP ADMIN

## 🔐 CÁCH TẠO TÀI KHOẢN ADMIN

### Bước 1: Đăng ký với email chứa "admin"

Email phải chứa từ "admin" (không phân biệt hoa thường):

✅ **Email hợp lệ cho admin:**
- `admin@gmail.com`
- `adminshop@example.com`
- `myadmin123@domain.com`
- `test.admin@company.com`

❌ **Email thường (role customer):**
- `user@gmail.com`
- `customer@example.com`

### Bước 2: Truy cập trang đăng ký
```
http://localhost:3000/register
```

### Bước 3: Điền form đăng ký
- **Họ và tên**: Admin User
- **Email**: admin@gmail.com (phải có chữ "admin")
- **Mật khẩu**: 123456 (hoặc bất kỳ)
- **Số điện thoại**: (tùy chọn)
- **Địa chỉ**: (tùy chọn)

### Bước 4: Đăng nhập
```
http://localhost:3000/login
```

Sau khi đăng nhập thành công với email admin, hệ thống sẽ tự động chuyển đến:
```
http://localhost:3000/admin
```

---

## 🎯 LUỒNG HOẠT ĐỘNG

```
┌─────────────────────────────────────────────────────────┐
│  1. ĐĂNG KÝ TÀI KHOẢN                                   │
│     - Email: admin@gmail.com                            │
│     - Password: 123456                                  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  2. BACKEND KIỂM TRA EMAIL                              │
│     - Nếu email.includes('admin') → role = 'admin'      │
│     - Nếu không → role = 'customer'                     │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  3. LƯU VÀO DATABASE                                    │
│     {                                                   │
│       email: "admin@gmail.com",                         │
│       role: "admin",                                    │
│       ...                                               │
│     }                                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  4. ĐĂNG NHẬP                                           │
│     - Email: admin@gmail.com                            │
│     - Password: 123456                                  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  5. BACKEND TRẢ VỀ                                      │
│     {                                                   │
│       success: true,                                    │
│       role: "admin",                                    │
│       customer: {...}                                   │
│     }                                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  6. FRONTEND XỬ LÝ                                      │
│     - Lưu vào localStorage:                             │
│       * localStorage.setItem('userRole', 'admin')       │
│       * localStorage.setItem('customer', {...})         │
│                                                         │
│     - Redirect dựa trên role:                           │
│       * if (role === 'admin') → /admin                  │
│       * else → /                                        │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│  7. TRANG ADMIN KIỂM TRA QUYỀN                          │
│     useEffect(() => {                                   │
│       const role = localStorage.getItem('userRole')     │
│       if (role !== 'admin') → redirect('/login')        │
│     })                                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ BẢO MẬT

### Middleware tự động kiểm tra:
```typescript
// Trong /admin/page.tsx
useEffect(() => {
  const userRole = localStorage.getItem('userRole');
  const customer = localStorage.getItem('customer');
  
  if (!customer || userRole !== 'admin') {
    router.push('/login'); // Redirect về login nếu không phải admin
  }
}, []);
```

### Tính năng đăng xuất:
```typescript
const handleLogout = () => {
  localStorage.removeItem('customer');
  localStorage.removeItem('userRole');
  router.push('/login');
};
```

---

## 📝 TEST THỰC TẾ

### Test 1: Đăng ký Admin
```
1. Mở: http://localhost:3000/register
2. Điền:
   - Email: admin@test.com
   - Password: 123456
   - Full name: Admin User
3. Submit → Chuyển đến /login
4. Đăng nhập → Tự động vào /admin
```

### Test 2: Đăng ký Customer
```
1. Mở: http://localhost:3000/register
2. Điền:
   - Email: user@test.com (không có "admin")
   - Password: 123456
   - Full name: Normal User
3. Submit → Chuyển đến /login
4. Đăng nhập → Vào trang chủ /
```

### Test 3: Truy cập trái phép
```
1. Chưa đăng nhập
2. Truy cập: http://localhost:3000/admin
3. Kết quả: Tự động redirect về /login
```

---

## 🔧 CẬP NHẬT DATABASE

Nếu database chưa có cột `role`, chạy SQL:

```sql
ALTER TABLE customers 
ADD COLUMN role VARCHAR(20) DEFAULT 'customer';

-- Cập nhật admin đã tồn tại
UPDATE customers 
SET role = 'admin' 
WHERE email LIKE '%admin%';
```

---

## ✅ CHECKLIST

- [ ] Database có cột `role` trong bảng `customers`
- [ ] Backend service gán role dựa trên email
- [ ] Login API trả về `role` trong response
- [ ] Frontend lưu `userRole` vào localStorage
- [ ] Trang admin kiểm tra quyền khi mount
- [ ] Nút đăng xuất xóa localStorage và redirect
- [ ] Test với email có/không có "admin"

---

## 🎨 GIAO DIỆN ADMIN

Khi đăng nhập thành công với quyền admin, bạn sẽ thấy:

- ✅ Dashboard với thống kê
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý khách hàng
- ✅ Quản lý danh mục
- ✅ Quản lý đánh giá
- ✅ Cài đặt hệ thống
