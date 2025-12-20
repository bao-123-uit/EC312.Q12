-- =====================================================
-- Tạo bảng messenger_orders
-- Lưu trữ đơn hàng từ Facebook Messenger Bot
-- =====================================================

-- Tạo bảng messenger_orders
CREATE TABLE IF NOT EXISTS messenger_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Thông tin Facebook
    facebook_user_id VARCHAR(255) NOT NULL,
    
    -- Thông tin khách hàng
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    
    -- Thông tin sản phẩm
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(12, 0) NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    color VARCHAR(100),
    
    -- Tổng tiền
    total_price DECIMAL(12, 0) NOT NULL DEFAULT 0,
    
    -- Ghi chú
    notes TEXT,
    
    -- Trạng thái đơn hàng
    -- pending: Chờ xác nhận
    -- confirmed: Đã xác nhận  
    -- processing: Đang xử lý
    -- shipping: Đang giao hàng
    -- delivered: Đã giao hàng
    -- cancelled: Đã hủy
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index để tìm kiếm nhanh theo facebook_user_id
CREATE INDEX IF NOT EXISTS idx_messenger_orders_facebook_user_id 
ON messenger_orders(facebook_user_id);

-- Index để tìm kiếm nhanh theo status
CREATE INDEX IF NOT EXISTS idx_messenger_orders_status 
ON messenger_orders(status);

-- Index để sắp xếp theo ngày tạo
CREATE INDEX IF NOT EXISTS idx_messenger_orders_created_at 
ON messenger_orders(created_at DESC);

-- Index để tìm kiếm theo số điện thoại
CREATE INDEX IF NOT EXISTS idx_messenger_orders_phone 
ON messenger_orders(phone);

-- Trigger tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_messenger_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger
DROP TRIGGER IF EXISTS trigger_update_messenger_orders_updated_at ON messenger_orders;
CREATE TRIGGER trigger_update_messenger_orders_updated_at
    BEFORE UPDATE ON messenger_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_messenger_orders_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE messenger_orders ENABLE ROW LEVEL SECURITY;

-- Policy cho phép service role đọc tất cả
CREATE POLICY "Service role can read all messenger_orders" 
ON messenger_orders FOR SELECT 
TO service_role 
USING (true);

-- Policy cho phép service role insert
CREATE POLICY "Service role can insert messenger_orders" 
ON messenger_orders FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Policy cho phép service role update
CREATE POLICY "Service role can update messenger_orders" 
ON messenger_orders FOR UPDATE 
TO service_role 
USING (true);

-- Policy cho phép authenticated users đọc đơn của họ (nếu cần)
-- CREATE POLICY "Users can read their own messenger_orders" 
-- ON messenger_orders FOR SELECT 
-- TO authenticated 
-- USING (facebook_user_id = auth.uid()::text);

-- =====================================================
-- Insert dữ liệu mẫu (optional - có thể comment out)
-- =====================================================

-- INSERT INTO messenger_orders (
--     facebook_user_id,
--     customer_name,
--     phone,
--     address,
--     product_name,
--     product_price,
--     quantity,
--     color,
--     total_price,
--     status
-- ) VALUES 
-- (
--     '1234567890',
--     'Nguyễn Văn A',
--     '0912345678',
--     '123 Đường ABC, Quận 1, TP.HCM',
--     'Ốp Silicone',
--     150000,
--     2,
--     'Đen',
--     300000,
--     'pending'
-- ),
-- (
--     '0987654321',
--     'Trần Thị B',
--     '0909876543',
--     '456 Đường XYZ, Quận 7, TP.HCM',
--     'Ốp Leather',
--     200000,
--     1,
--     'Nâu',
--     200000,
--     'confirmed'
-- );

-- =====================================================
-- View thống kê đơn hàng (optional)
-- =====================================================

CREATE OR REPLACE VIEW messenger_orders_stats AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
    COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
    COUNT(CASE WHEN status = 'shipping' THEN 1 END) as shipping_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
    SUM(total_price) as total_revenue,
    SUM(CASE WHEN status = 'delivered' THEN total_price ELSE 0 END) as completed_revenue,
    DATE(created_at) as order_date
FROM messenger_orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- =====================================================
-- Comment giải thích các cột
-- =====================================================

COMMENT ON TABLE messenger_orders IS 'Bảng lưu trữ đơn hàng từ Facebook Messenger Bot';
COMMENT ON COLUMN messenger_orders.facebook_user_id IS 'ID người dùng Facebook (PSID)';
COMMENT ON COLUMN messenger_orders.customer_name IS 'Tên khách hàng';
COMMENT ON COLUMN messenger_orders.phone IS 'Số điện thoại liên hệ';
COMMENT ON COLUMN messenger_orders.address IS 'Địa chỉ giao hàng';
COMMENT ON COLUMN messenger_orders.product_name IS 'Tên sản phẩm đặt mua';
COMMENT ON COLUMN messenger_orders.product_price IS 'Giá sản phẩm (VNĐ)';
COMMENT ON COLUMN messenger_orders.quantity IS 'Số lượng đặt mua';
COMMENT ON COLUMN messenger_orders.color IS 'Màu sắc sản phẩm';
COMMENT ON COLUMN messenger_orders.total_price IS 'Tổng tiền đơn hàng (VNĐ)';
COMMENT ON COLUMN messenger_orders.status IS 'Trạng thái đơn: pending, confirmed, processing, shipping, delivered, cancelled';
