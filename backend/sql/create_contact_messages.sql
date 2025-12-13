-- Tạo bảng contact_messages để lưu tin nhắn liên hệ từ khách hàng
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, replied, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho tìm kiếm nhanh
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy cho phép insert từ bất kỳ ai (anonymous)
CREATE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

-- Policy cho phép admin đọc tất cả
CREATE POLICY "Admin can view all contact messages" ON contact_messages
    FOR SELECT USING (true);

-- Policy cho phép admin update
CREATE POLICY "Admin can update contact messages" ON contact_messages
    FOR UPDATE USING (true);

-- Policy cho phép admin delete
CREATE POLICY "Admin can delete contact messages" ON contact_messages
    FOR DELETE USING (true);
