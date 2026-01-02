-- Thêm cột payment_order_code và payment_status vào bảng gifts
-- Để hỗ trợ thanh toán PayOS cho quà tặng

-- Thêm cột payment_order_code để lưu mã thanh toán PayOS
ALTER TABLE gifts 
ADD COLUMN IF NOT EXISTS payment_order_code VARCHAR(50);

-- Thêm cột payment_status để theo dõi trạng thái thanh toán
ALTER TABLE gifts 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Thêm cột payment_date để lưu ngày thanh toán
ALTER TABLE gifts 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- BƯỚC 1: Cập nhật các row có status='pending' thành 'sent' trước
UPDATE gifts SET status = 'sent' WHERE status = 'pending';

-- BƯỚC 2: Xóa constraint cũ (nếu có)
ALTER TABLE gifts DROP CONSTRAINT IF EXISTS gifts_status_check;

-- BƯỚC 3: Thêm constraint mới (bao gồm pending_payment)
ALTER TABLE gifts ADD CONSTRAINT gifts_status_check 
CHECK (status IN ('pending_payment', 'sent', 'verified', 'claimed', 'expired', 'cancelled'));

-- Tạo index cho payment_order_code để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_gifts_payment_order_code ON gifts(payment_order_code);

-- Comment
COMMENT ON COLUMN gifts.payment_order_code IS 'Mã đơn hàng PayOS để xác minh thanh toán';
COMMENT ON COLUMN gifts.payment_status IS 'Trạng thái thanh toán: pending, paid, failed, cancelled';
COMMENT ON COLUMN gifts.payment_date IS 'Ngày giờ thanh toán thành công';
