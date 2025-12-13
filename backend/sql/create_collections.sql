-- Tạo bảng collections (Bộ sưu tập)
CREATE TABLE IF NOT EXISTS collections (
    collection_id SERIAL PRIMARY KEY,
    collection_name VARCHAR(100) NOT NULL,
    collection_slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    gradient_color VARCHAR(100) DEFAULT 'from-purple-500 to-pink-500',
    icon_name VARCHAR(50) DEFAULT 'Sparkles',
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    collection_type VARCHAR(20) DEFAULT 'normal', -- normal, seasonal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng liên kết product_collections (1 sản phẩm có thể thuộc nhiều bộ sưu tập)
CREATE TABLE IF NOT EXISTS product_collections (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    collection_id INT NOT NULL REFERENCES collections(collection_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, collection_id)
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(collection_slug);
CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(collection_type);
CREATE INDEX IF NOT EXISTS idx_product_collections_product ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection ON product_collections(collection_id);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Policies cho collections
CREATE POLICY "Anyone can view collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert collections" ON collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update collections" ON collections FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete collections" ON collections FOR DELETE USING (true);

-- Policies cho product_collections
CREATE POLICY "Anyone can view product_collections" ON product_collections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert product_collections" ON product_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update product_collections" ON product_collections FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete product_collections" ON product_collections FOR DELETE USING (true);

-- Insert các bộ sưu tập mặc định
INSERT INTO collections (collection_name, collection_slug, description, gradient_color, icon_name, display_order, is_featured, collection_type) VALUES
('Luxury Edition', 'luxury-edition', 'Bộ sưu tập cao cấp với chất liệu da thật và kim loại nguyên khối', 'from-amber-500 via-yellow-500 to-orange-500', 'Crown', 1, true, 'normal'),
('Minimalist', 'minimalist', 'Thiết kế tối giản, tinh tế cho người yêu thích sự đơn giản', 'from-gray-700 via-gray-800 to-gray-900', 'Gem', 2, false, 'normal'),
('Artistic Series', 'artistic-series', 'Họa tiết nghệ thuật độc đáo từ các nghệ sĩ hàng đầu', 'from-purple-500 via-pink-500 to-red-500', 'Palette', 3, false, 'normal'),
('Gaming Pro', 'gaming-pro', 'Dành cho game thủ với thiết kế RGB và grip chống trượt', 'from-green-400 via-cyan-500 to-blue-500', 'Zap', 4, false, 'normal'),
('Rugged Armor', 'rugged-armor', 'Bảo vệ tối đa với chuẩn quân đội, chống va đập cực tốt', 'from-slate-600 via-slate-700 to-slate-800', 'Shield', 5, false, 'normal'),
('Limited Edition', 'limited-edition', 'Phiên bản giới hạn, số lượng có hạn, thiết kế độc quyền', 'from-rose-500 via-pink-600 to-purple-600', 'Sparkles', 6, true, 'normal'),
('Giáng Sinh - Noel', 'giang-sinh-noel', 'Bộ sưu tập đặc biệt mùa Giáng sinh', 'from-red-600 to-green-600', 'Gift', 7, false, 'seasonal'),
('Valentine', 'valentine', 'Bộ sưu tập tình yêu cho ngày Valentine', 'from-red-400 to-pink-500', 'Heart', 8, false, 'seasonal'),
('Tết Nguyên Đán', 'tet-nguyen-dan', 'Bộ sưu tập đón Tết cổ truyền Việt Nam', 'from-yellow-500 to-red-500', 'Sparkles', 9, false, 'seasonal')
ON CONFLICT (collection_slug) DO NOTHING;
