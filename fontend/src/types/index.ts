// File: fontend/src/types/index.ts

export interface Product {
  id: number;
  product_id?: number;
  name: string;
  product_name?: string;
  price: number;
  image: string;
  image_url?: string;
  rating: number;
  reviews: number;
  tag?: string;
  category?: string;
  category_id?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  name: string;
  icon: string;
  count: number;
}

export interface BannerSlide {
  title: string;
  subtitle: string;
  image?: string;
}