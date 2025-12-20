/**
 * Facebook Messenger Bot Types
 * Định nghĩa các kiểu dữ liệu cho Messenger Bot
 */

// Trạng thái của cuộc hội thoại đặt hàng
export enum ConversationState {
  IDLE = 'IDLE',                           // Chờ người dùng bắt đầu
  WAITING_PRODUCT = 'WAITING_PRODUCT',     // Đang chờ chọn sản phẩm
  WAITING_PHONE_MODEL = 'WAITING_PHONE_MODEL', // Đang chờ chọn dòng máy điện thoại
  WAITING_QUANTITY = 'WAITING_QUANTITY',   // Đang chờ nhập số lượng
  WAITING_COLOR = 'WAITING_COLOR',         // Đang chờ chọn màu sắc
  WAITING_NAME = 'WAITING_NAME',           // Đang chờ nhập tên
  WAITING_PHONE = 'WAITING_PHONE',         // Đang chờ nhập số điện thoại
  WAITING_ADDRESS = 'WAITING_ADDRESS',     // Đang chờ nhập địa chỉ
  WAITING_CONFIRM = 'WAITING_CONFIRM',     // Đang chờ xác nhận đơn hàng
}

// Thông tin sản phẩm
export interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
  description?: string;
  colors?: string[];
  image_url?: string;
  stock_quantity?: number;
}

// Thông tin dòng máy điện thoại
export interface PhoneModelInfo {
  model_id: number;
  brand_name: string;
  model_name: string;
}

// Dữ liệu phiên đặt hàng của khách
export interface UserSession {
  state: ConversationState;
  selectedProduct?: Product;
  selectedPhoneModel?: PhoneModelInfo;
  quantity?: number;
  color?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Đơn hàng từ Messenger
export interface MessengerOrder {
  id?: string;
  facebook_user_id: string;
  customer_name: string;
  phone: string;
  address: string;
  product_name: string;
  product_price: number;
  quantity: number;
  color?: string;
  phone_model_id?: number;
  phone_model_name?: string;
  notes?: string;
  total_price: number;
  status: OrderStatus;
  created_at?: Date;
  updated_at?: Date;
}

// Trạng thái đơn hàng
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Payload từ Facebook Webhook
export interface FacebookWebhookPayload {
  object: string;
  entry: FacebookEntry[];
}

export interface FacebookEntry {
  id: string;
  time: number;
  messaging: FacebookMessaging[];
}

export interface FacebookMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: FacebookMessage;
  postback?: FacebookPostback;
}

export interface FacebookMessage {
  mid: string;
  text?: string;
  quick_reply?: {
    payload: string;
  };
  attachments?: any[];
}

export interface FacebookPostback {
  title: string;
  payload: string;
}

// Quick Reply Button
export interface QuickReply {
  content_type: 'text';
  title: string;
  payload: string;
}

// Generic Template Element
export interface GenericElement {
  title: string;
  subtitle?: string;
  image_url?: string;
  buttons?: Button[];
}

// Button types
export interface Button {
  type: 'postback' | 'web_url' | 'phone_number';
  title: string;
  payload?: string;
  url?: string;
}

// Response message types
export interface TextMessage {
  text: string;
  quick_replies?: QuickReply[];
}

export interface TemplateMessage {
  attachment: {
    type: 'template';
    payload: {
      template_type: 'generic' | 'button' | 'receipt';
      elements?: GenericElement[];
      text?: string;
      buttons?: Button[];
    };
  };
}

// Webhook để gửi đến hệ thống quản lý
export interface WebhookOrderPayload {
  customer_name: string;
  phone: string;
  address: string;
  product: string;
  quantity: number;
  color?: string;
  notes?: string;
  total_price: number;
  facebook_user_id: string;
  order_id?: string;
  created_at: string;
}
