-- Thêm cột user_id để hỗ trợ users table (UUID)
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Tạo unique index để tránh duplicate
CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlists_user_product ON wishlists(user_id, product_id) WHERE user_id IS NOT NULL;
