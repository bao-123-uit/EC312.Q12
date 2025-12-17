-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.banners (
  banner_id integer NOT NULL DEFAULT nextval('banners_banner_id_seq'::regclass),
  title character varying,
  subtitle character varying,
  image_url character varying NOT NULL,
  mobile_image_url character varying,
  link_url character varying,
  button_text character varying,
  position character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  valid_from timestamp without time zone,
  valid_to timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT banners_pkey PRIMARY KEY (banner_id)
);
CREATE TABLE public.blog_posts (
  post_id integer NOT NULL DEFAULT nextval('blog_posts_post_id_seq'::regclass),
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  featured_image character varying,
  author_id integer,
  category character varying,
  tags text,
  view_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  published_at timestamp without time zone,
  meta_title character varying,
  meta_description text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT blog_posts_pkey PRIMARY KEY (post_id)
);
CREATE TABLE public.brands (
  brand_id integer NOT NULL DEFAULT nextval('brands_brand_id_seq'::regclass),
  brand_name character varying NOT NULL,
  brand_slug character varying NOT NULL UNIQUE,
  logo_url character varying,
  description text,
  country_origin character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT brands_pkey PRIMARY KEY (brand_id)
);
CREATE TABLE public.bundle_deals (
  bundle_id integer NOT NULL DEFAULT nextval('bundle_deals_bundle_id_seq'::regclass),
  bundle_name character varying NOT NULL,
  bundle_slug character varying NOT NULL UNIQUE,
  bundle_type character varying NOT NULL,
  buy_quantity integer,
  get_quantity integer,
  discount_percent numeric,
  discount_amount numeric,
  description text,
  is_active boolean DEFAULT true,
  valid_from timestamp without time zone NOT NULL,
  valid_to timestamp without time zone NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bundle_deals_pkey PRIMARY KEY (bundle_id)
);
CREATE TABLE public.bundle_products (
  id integer NOT NULL DEFAULT nextval('bundle_products_id_seq'::regclass),
  bundle_id integer,
  product_id integer,
  quantity integer DEFAULT 1,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bundle_products_pkey PRIMARY KEY (id),
  CONSTRAINT bundle_products_bundle_id_fkey FOREIGN KEY (bundle_id) REFERENCES public.bundle_deals(bundle_id),
  CONSTRAINT bundle_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.categories (
  category_id integer NOT NULL DEFAULT nextval('categories_category_id_seq'::regclass),
  category_name character varying NOT NULL,
  category_slug character varying NOT NULL UNIQUE,
  parent_category_id integer,
  description text,
  image_url character varying,
  icon_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categories_pkey PRIMARY KEY (category_id),
  CONSTRAINT categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.categories(category_id)
);
CREATE TABLE public.contact_messages (
  id integer NOT NULL DEFAULT nextval('contact_messages_id_seq'::regclass),
  name character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  subject character varying,
  message text NOT NULL,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.coupons (
  coupon_id integer NOT NULL DEFAULT nextval('coupons_coupon_id_seq'::regclass),
  coupon_code character varying NOT NULL UNIQUE,
  coupon_type character varying NOT NULL,
  discount_value numeric NOT NULL,
  min_order_amount numeric,
  max_discount_amount numeric,
  usage_limit integer,
  used_count integer DEFAULT 0,
  valid_from timestamp without time zone NOT NULL,
  valid_to timestamp without time zone NOT NULL,
  is_active boolean DEFAULT true,
  description text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT coupons_pkey PRIMARY KEY (coupon_id)
);
CREATE TABLE public.customer_addresses (
  address_id integer NOT NULL DEFAULT nextval('customer_addresses_address_id_seq'::regclass),
  customer_id integer,
  address_type character varying,
  full_name character varying,
  phone character varying,
  address_line1 character varying NOT NULL,
  address_line2 character varying,
  ward character varying,
  district character varying,
  city character varying NOT NULL,
  postal_code character varying,
  country character varying DEFAULT 'Vietnam'::character varying,
  is_default boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT customer_addresses_pkey PRIMARY KEY (address_id),
  CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id)
);
CREATE TABLE public.customers (
  customer_id integer NOT NULL DEFAULT nextval('customers_customer_id_seq'::regclass),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  first_name character varying,
  last_name character varying,
  phone character varying,
  date_of_birth date,
  gender character varying,
  avatar_url character varying,
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  loyalty_points integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  last_login timestamp without time zone,
  CONSTRAINT customers_pkey PRIMARY KEY (customer_id)
);
CREATE TABLE public.design_collections (
  collection_id integer NOT NULL DEFAULT nextval('design_collections_collection_id_seq'::regclass),
  collection_name character varying NOT NULL,
  collection_slug character varying NOT NULL UNIQUE,
  description text,
  banner_image character varying,
  thumbnail_image character varying,
  theme_color character varying,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  valid_from timestamp without time zone,
  valid_to timestamp without time zone,
  view_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT design_collections_pkey PRIMARY KEY (collection_id)
);
CREATE TABLE public.flash_sales (
  flash_sale_id integer NOT NULL DEFAULT nextval('flash_sales_flash_sale_id_seq'::regclass),
  sale_name character varying NOT NULL,
  product_id integer,
  variant_id integer,
  original_price numeric NOT NULL,
  flash_price numeric NOT NULL,
  discount_percent numeric,
  quantity_limit integer,
  quantity_sold integer DEFAULT 0,
  start_time timestamp without time zone NOT NULL,
  end_time timestamp without time zone NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT flash_sales_pkey PRIMARY KEY (flash_sale_id),
  CONSTRAINT flash_sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT flash_sales_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id)
);
CREATE TABLE public.inventory (
  inventory_id integer NOT NULL DEFAULT nextval('inventory_inventory_id_seq'::regclass),
  product_id integer,
  variant_id integer,
  warehouse_location character varying,
  quantity_available integer DEFAULT 0,
  quantity_reserved integer DEFAULT 0,
  quantity_sold integer DEFAULT 0,
  reorder_level integer DEFAULT 10,
  reorder_quantity integer DEFAULT 50,
  last_restock_date timestamp without time zone,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inventory_pkey PRIMARY KEY (inventory_id),
  CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT inventory_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id)
);
CREATE TABLE public.inventory_transactions (
  transaction_id integer NOT NULL DEFAULT nextval('inventory_transactions_transaction_id_seq'::regclass),
  product_id integer,
  variant_id integer,
  transaction_type character varying NOT NULL,
  quantity integer NOT NULL,
  reference_type character varying,
  reference_id integer,
  note text,
  created_by character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT inventory_transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT inventory_transactions_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id)
);
CREATE TABLE public.notifications (
  notification_id integer NOT NULL DEFAULT nextval('notifications_notification_id_seq'::regclass),
  customer_id integer,
  type character varying NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  link_url character varying,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT notifications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id)
);
CREATE TABLE public.order_history (
  history_id integer NOT NULL DEFAULT nextval('order_history_history_id_seq'::regclass),
  order_id integer,
  status character varying NOT NULL,
  note text,
  created_by character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT order_history_pkey PRIMARY KEY (history_id),
  CONSTRAINT order_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.order_items (
  order_item_id integer NOT NULL DEFAULT nextval('order_items_order_item_id_seq'::regclass),
  order_id integer,
  product_id integer,
  variant_id integer,
  product_name character varying NOT NULL,
  variant_name character varying,
  sku character varying NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  total_price numeric NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id)
);
CREATE TABLE public.orders (
  order_id integer NOT NULL DEFAULT nextval('orders_order_id_seq'::regclass),
  order_number character varying NOT NULL UNIQUE,
  customer_id integer,
  order_status character varying DEFAULT 'pending'::character varying,
  payment_status character varying DEFAULT 'unpaid'::character varying,
  payment_method character varying,
  shipping_method character varying,
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  shipping_fee numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  coupon_code character varying,
  shipping_address_id integer,
  billing_address_id integer,
  customer_note text,
  admin_note text,
  tracking_number character varying,
  shipped_at timestamp without time zone,
  delivered_at timestamp without time zone,
  cancelled_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.customer_addresses(address_id),
  CONSTRAINT orders_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.customer_addresses(address_id)
);
CREATE TABLE public.payment_transactions (
  transaction_id integer NOT NULL DEFAULT nextval('payment_transactions_transaction_id_seq'::regclass),
  order_id integer,
  payment_gateway character varying NOT NULL,
  transaction_ref character varying UNIQUE,
  amount numeric NOT NULL,
  currency character varying DEFAULT 'VND'::character varying,
  status character varying NOT NULL,
  payment_date timestamp without time zone,
  response_data text,
  ip_address character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.phone_models (
  model_id integer NOT NULL DEFAULT nextval('phone_models_model_id_seq'::regclass),
  brand_name character varying NOT NULL,
  model_name character varying NOT NULL,
  model_code character varying,
  release_year integer,
  screen_size numeric,
  dimensions character varying,
  weight character varying,
  image_url character varying,
  is_popular boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT phone_models_pkey PRIMARY KEY (model_id)
);
CREATE TABLE public.product_attributes (
  attribute_id integer NOT NULL DEFAULT nextval('product_attributes_attribute_id_seq'::regclass),
  product_id integer,
  attribute_name character varying NOT NULL,
  attribute_value text NOT NULL,
  CONSTRAINT product_attributes_pkey PRIMARY KEY (attribute_id),
  CONSTRAINT product_attributes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.product_collections (
  id integer NOT NULL DEFAULT nextval('product_collections_id_seq'::regclass),
  product_id integer,
  collection_id integer,
  display_order integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_collections_pkey PRIMARY KEY (id),
  CONSTRAINT product_collections_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT product_collections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.design_collections(collection_id)
);
CREATE TABLE public.product_compatibility (
  compatibility_id integer NOT NULL DEFAULT nextval('product_compatibility_compatibility_id_seq'::regclass),
  product_id integer,
  phone_model_id integer,
  fit_type character varying DEFAULT 'exact'::character varying,
  notes text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_compatibility_pkey PRIMARY KEY (compatibility_id),
  CONSTRAINT product_compatibility_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT product_compatibility_phone_model_id_fkey FOREIGN KEY (phone_model_id) REFERENCES public.phone_models(model_id)
);
CREATE TABLE public.product_images (
  image_id integer NOT NULL DEFAULT nextval('product_images_image_id_seq'::regclass),
  product_id integer,
  variant_id integer,
  image_url character varying NOT NULL,
  alt_text character varying,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_images_pkey PRIMARY KEY (image_id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT product_images_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id)
);
CREATE TABLE public.product_reviews (
  review_id integer NOT NULL DEFAULT nextval('product_reviews_review_id_seq'::regclass),
  product_id integer,
  customer_id integer,
  order_id integer,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title character varying,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_reviews_pkey PRIMARY KEY (review_id),
  CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT product_reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT product_reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.product_variants (
  variant_id integer NOT NULL DEFAULT nextval('product_variants_variant_id_seq'::regclass),
  product_id integer,
  sku character varying NOT NULL UNIQUE,
  variant_name character varying,
  color character varying,
  color_code character varying,
  size character varying,
  material character varying,
  price numeric,
  sale_price numeric,
  image_url character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT product_variants_pkey PRIMARY KEY (variant_id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.products (
  product_id integer NOT NULL DEFAULT nextval('products_product_id_seq'::regclass),
  product_name character varying NOT NULL,
  product_slug character varying NOT NULL UNIQUE,
  category_id integer,
  brand_id integer,
  sku character varying NOT NULL UNIQUE,
  description text,
  short_description text,
  price numeric NOT NULL,
  sale_price numeric,
  cost_price numeric,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  status character varying DEFAULT 'active'::character varying,
  meta_title character varying,
  meta_description text,
  meta_keywords text,
  view_count integer DEFAULT 0,
  rating_average numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT products_pkey PRIMARY KEY (product_id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id),
  CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id)
);
CREATE TABLE public.recently_viewed (
  id integer NOT NULL DEFAULT nextval('recently_viewed_id_seq'::regclass),
  customer_id integer,
  product_id integer,
  viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT recently_viewed_pkey PRIMARY KEY (id),
  CONSTRAINT recently_viewed_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT recently_viewed_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.refunds (
  refund_id integer NOT NULL DEFAULT nextval('refunds_refund_id_seq'::regclass),
  order_id integer,
  refund_amount numeric NOT NULL,
  refund_reason text NOT NULL,
  refund_status character varying DEFAULT 'pending'::character varying,
  refund_method character varying,
  processed_by integer,
  approved_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT refunds_pkey PRIMARY KEY (refund_id),
  CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT refunds_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.staff(staff_id)
);
CREATE TABLE public.review_images (
  review_image_id integer NOT NULL DEFAULT nextval('review_images_review_image_id_seq'::regclass),
  review_id integer,
  image_url character varying NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT review_images_pkey PRIMARY KEY (review_image_id),
  CONSTRAINT review_images_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.product_reviews(review_id)
);
CREATE TABLE public.search_logs (
  search_id integer NOT NULL DEFAULT nextval('search_logs_search_id_seq'::regclass),
  customer_id integer,
  search_query character varying NOT NULL,
  results_count integer DEFAULT 0,
  clicked_product_id integer,
  search_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT search_logs_pkey PRIMARY KEY (search_id),
  CONSTRAINT search_logs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT search_logs_clicked_product_id_fkey FOREIGN KEY (clicked_product_id) REFERENCES public.products(product_id)
);
CREATE TABLE public.shipping_rates (
  rate_id integer NOT NULL DEFAULT nextval('shipping_rates_rate_id_seq'::regclass),
  zone_id integer,
  shipping_method character varying NOT NULL,
  min_order_amount numeric DEFAULT 0,
  max_order_amount numeric,
  shipping_fee numeric NOT NULL,
  estimated_days character varying,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shipping_rates_pkey PRIMARY KEY (rate_id),
  CONSTRAINT shipping_rates_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(zone_id)
);
CREATE TABLE public.shipping_zones (
  zone_id integer NOT NULL DEFAULT nextval('shipping_zones_zone_id_seq'::regclass),
  zone_name character varying NOT NULL,
  countries text,
  cities text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shipping_zones_pkey PRIMARY KEY (zone_id)
);
CREATE TABLE public.shopping_carts (
  cart_id integer NOT NULL DEFAULT nextval('shopping_carts_cart_id_seq'::regclass),
  customer_id uuid,
  product_id integer,
  variant_id integer,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT shopping_carts_pkey PRIMARY KEY (cart_id),
  CONSTRAINT shopping_carts_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT shopping_carts_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id),
  CONSTRAINT shopping_carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id)
);
CREATE TABLE public.staff (
  staff_id integer NOT NULL DEFAULT nextval('staff_staff_id_seq'::regclass),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  full_name character varying NOT NULL,
  phone character varying,
  role character varying NOT NULL,
  permissions text,
  is_active boolean DEFAULT true,
  last_login timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT staff_pkey PRIMARY KEY (staff_id)
);
CREATE TABLE public.system_settings (
  setting_id integer NOT NULL DEFAULT nextval('system_settings_setting_id_seq'::regclass),
  setting_key character varying NOT NULL UNIQUE,
  setting_value text,
  setting_type character varying,
  description text,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT system_settings_pkey PRIMARY KEY (setting_id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name character varying,
  phone character varying,
  avatar_url text,
  address text,
  is_admin boolean DEFAULT false,
  role character varying DEFAULT 'user'::character varying,
  status character varying DEFAULT 'active'::character varying,
  email_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login_at timestamp with time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wishlists (
  wishlist_id integer NOT NULL DEFAULT nextval('wishlists_wishlist_id_seq'::regclass),
  customer_id integer,
  product_id integer,
  variant_id integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT wishlists_pkey PRIMARY KEY (wishlist_id),
  CONSTRAINT wishlists_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id),
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id),
  CONSTRAINT wishlists_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id)
);