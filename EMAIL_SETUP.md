# Hướng Dẫn Cấu Hình Gửi Email Thật

## Bước 1: Tạo App Password Gmail

1. Truy cập [Google Account](https://myaccount.google.com/)
2. Vào **Security** (Bảo mật)
3. Bật **2-Step Verification** (Xác minh 2 bước) nếu chưa bật
4. Sau khi bật, vào **App passwords** (Mật khẩu ứng dụng)
5. Chọn **Mail** và **Windows Computer**
6. Click **Generate** - Google sẽ tạo mật khẩu 16 ký tự
7. **Lưu mật khẩu này** (chỉ hiện 1 lần)

## Bước 2: Thêm vào file .env của backend

Tạo file `backend/.env` với nội dung:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # App Password 16 ký tự từ Google

# Frontend URL (để tạo link trong email)
FRONTEND_URL=http://localhost:3000
```

## Bước 3: Chạy SQL tạo bảng gifts

Vào Supabase SQL Editor và chạy file `backend/sql/create_gifts.sql`

## Bước 4: Test

1. Chạy backend: `npm run start:dev`
2. Chạy frontend: `npm run dev`
3. Vào trang sản phẩm → Click "Gửi Tặng Bạn Bè"
4. Điền thông tin và gửi
5. Kiểm tra email người nhận

## Lưu ý quan trọng

- **KHÔNG commit file .env** lên GitHub
- App Password khác với mật khẩu đăng nhập Gmail
- Nếu dùng email công ty (Google Workspace), cần admin bật "Less secure apps"

## Thay thế bằng SMTP khác (tùy chọn)

Nếu không muốn dùng Gmail, có thể dùng:
- **SendGrid**: https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/
- **AWS SES**: https://aws.amazon.com/ses/

Chỉ cần thay đổi cấu hình transporter trong `gift.service.ts`.
