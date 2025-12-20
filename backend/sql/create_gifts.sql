-- Tạo bảng gifts để lưu thông tin quà tặng
CREATE TABLE IF NOT EXISTS gifts (
    gift_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Thông tin người gửi
    sender_id UUID REFERENCES users(user_id),
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_message TEXT,
    
    -- Thông tin người nhận
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(20),
    recipient_address TEXT,
    
    -- Thông tin sản phẩm
    product_id INTEGER REFERENCES products(product_id) NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- Mã xác nhận
    verification_code VARCHAR(10) NOT NULL,
    
    -- Trạng thái: pending, verified, claimed, expired, cancelled
    status VARCHAR(20) DEFAULT 'pending',
    
    -- Thời gian
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    
    -- Ghi chú
    notes TEXT
);

-- Index để tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_gifts_recipient_email ON gifts(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gifts_verification_code ON gifts(verification_code);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_gifts_sender_id ON gifts(sender_id);

-- Bảng lưu lịch sử email đã gửi
CREATE TABLE IF NOT EXISTS gift_emails (
    email_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gift_id UUID REFERENCES gifts(gift_id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL, -- notification, reminder, confirmation
    sent_to VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent' -- sent, failed, bounced
);

-- Comment
COMMENT ON TABLE gifts IS 'Bảng lưu thông tin quà tặng sản phẩm';
COMMENT ON COLUMN gifts.verification_code IS 'Mã 6 số để xác nhận nhận quà';
COMMENT ON COLUMN gifts.status IS 'pending: chờ xác nhận, verified: đã xác nhận email, claimed: đã nhận quà, expired: hết hạn, cancelled: đã hủy';
