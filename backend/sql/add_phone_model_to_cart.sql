-- Thêm cột phone_model_id vào bảng shopping_carts
-- Để lưu dòng máy điện thoại người dùng chọn khi thêm ốp vào giỏ

ALTER TABLE public.shopping_carts
ADD COLUMN phone_model_id integer,
ADD COLUMN phone_model_name character varying(100);

-- Thêm foreign key (optional - có thể bỏ nếu muốn linh hoạt hơn)
-- ALTER TABLE public.shopping_carts
-- ADD CONSTRAINT shopping_carts_phone_model_id_fkey 
--   FOREIGN KEY (phone_model_id) 
--   REFERENCES public.phone_models(model_id);

-- Thêm cột phone_model vào order_items để lưu khi checkout
ALTER TABLE public.order_items
ADD COLUMN phone_model_id integer,
ADD COLUMN phone_model_name character varying(100);

COMMENT ON COLUMN public.shopping_carts.phone_model_id IS 'ID của dòng máy điện thoại được chọn';
COMMENT ON COLUMN public.shopping_carts.phone_model_name IS 'Tên dòng máy (backup)';
COMMENT ON COLUMN public.order_items.phone_model_id IS 'ID dòng máy đã chọn khi đặt hàng';
COMMENT ON COLUMN public.order_items.phone_model_name IS 'Tên dòng máy (backup)';
