-- Bảng lưu phone templates (các mẫu điện thoại có sẵn)
CREATE TABLE IF NOT EXISTS phone_templates (
    template_id SERIAL PRIMARY KEY,
    phone_model VARCHAR(100) NOT NULL, -- iPhone 15, Samsung S24, etc.
    brand VARCHAR(50) NOT NULL, -- Apple, Samsung, Xiaomi, etc.
    template_image_url TEXT NOT NULL, -- Ảnh template chuẩn (khung điện thoại)
    print_width_mm DECIMAL(10,2) DEFAULT 70, -- Chiều rộng vùng in (mm)
    print_height_mm DECIMAL(10,2) DEFAULT 150, -- Chiều cao vùng in (mm)
    canvas_width INT DEFAULT 700, -- Chiều rộng canvas (px)
    canvas_height INT DEFAULT 1500, -- Chiều cao canvas (px)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu các thiết kế của khách hàng
CREATE TABLE IF NOT EXISTS custom_designs (
    design_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Tham chiếu đến users(id) - UUID
    guest_email VARCHAR(255), -- Email khách vãng lai
    guest_name VARCHAR(100), -- Tên khách vãng lai
    guest_phone VARCHAR(20), -- SĐT khách vãng lai
    
    -- Thông tin template
    template_id INTEGER REFERENCES phone_templates(template_id),
    phone_model VARCHAR(100) NOT NULL,
    
    -- Dữ liệu thiết kế (JSON từ Fabric.js)
    design_data JSONB NOT NULL, -- Chứa toàn bộ canvas data
    preview_image_url TEXT, -- Ảnh preview chất lượng thấp
    high_res_image_url TEXT, -- Ảnh render chất lượng cao (sau khi xử lý)
    
    -- Trạng thái
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'processing', 'approved', 'rejected', 'printed')),
    admin_notes TEXT, -- Ghi chú của admin
    
    -- Thông tin đơn hàng (nếu có)
    order_id INTEGER REFERENCES orders(order_id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITHOUT TIME ZONE, -- Thời điểm gửi cho admin
    processed_at TIMESTAMP WITHOUT TIME ZONE -- Thời điểm admin xử lý xong
);

-- Bảng lưu các ảnh khách upload cho thiết kế
CREATE TABLE IF NOT EXISTS design_images (
    image_id SERIAL PRIMARY KEY,
    design_id INTEGER REFERENCES custom_designs(design_id) ON DELETE CASCADE,
    original_url TEXT NOT NULL, -- URL ảnh gốc full resolution
    thumbnail_url TEXT, -- URL ảnh thumbnail
    file_name VARCHAR(255),
    file_size INT, -- bytes
    width INT,
    height INT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để query nhanh
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON custom_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_status ON custom_designs(status);
CREATE INDEX IF NOT EXISTS idx_designs_order_id ON custom_designs(order_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON custom_designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_design_images_design_id ON design_images(design_id);

-- Insert một số phone templates mẫu
INSERT INTO phone_templates (phone_model, brand, template_image_url, print_width_mm, print_height_mm) VALUES
('iPhone 15', 'Apple', '/templates/iphone15.svg', 71.6, 147.6),
('iPhone 15 Pro', 'Apple', '/templates/iphone15pro.svg', 70.6, 146.6),
('iPhone 15 Pro Max', 'Apple', '/templates/iphone15promax.svg', 76.7, 159.9),
('iPhone 14', 'Apple', '/templates/iphone14.svg', 71.5, 146.7),
('iPhone 14 Pro', 'Apple', '/templates/iphone14pro.svg', 71.5, 147.5),
('Samsung Galaxy S24', 'Samsung', '/templates/samsung-s24.svg', 70.6, 147.0),
('Samsung Galaxy S24 Ultra', 'Samsung', '/templates/samsung-s24-ultra.svg', 79.0, 162.3),
('Xiaomi 14', 'Xiaomi', '/templates/xiaomi14.svg', 71.5, 152.8),
('OPPO Find X7', 'OPPO', '/templates/oppo-findx7.svg', 74.2, 162.2)
ON CONFLICT DO NOTHING;
