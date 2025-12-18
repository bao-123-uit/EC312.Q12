-- Wishlists table (nếu chưa có)
-- Nếu bảng wishlists đã tồn tại, script này sẽ không chạy

-- Kiểm tra cấu trúc bảng wishlists hiện có
-- Cần có các cột: id, customer_id, product_id, variant_id, created_at

-- Ví dụ cấu trúc:
-- CREATE TABLE IF NOT EXISTS wishlists (
--     id SERIAL PRIMARY KEY,
--     customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
--     variant_id INTEGER,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     UNIQUE(customer_id, product_id)
-- );

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_wishlists_customer_id ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);
