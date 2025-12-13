-- Thêm cột season vào bảng products
-- Giá trị: NULL (không thuộc mùa nào), 'noel', 'valentine', 'tet'

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS season VARCHAR(20) DEFAULT NULL;

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_products_season ON products(season);

-- Comment để giải thích
COMMENT ON COLUMN products.season IS 'Mùa lễ: noel, valentine, tet hoặc NULL';
