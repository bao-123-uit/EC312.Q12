/**
 * Messenger DTOs
 * Data Transfer Objects cho Messenger Controller
 */

// DTO cho Facebook Webhook Entry Messaging
export class FacebookMessagingDto {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    quick_reply?: { payload: string };
    attachments?: any[];
  };
  postback?: {
    title: string;
    payload: string;
  };
}

// DTO cho Facebook Webhook Entry
export class FacebookEntryDto {
  id: string;
  time: number;
  messaging: FacebookMessagingDto[];
}

// DTO cho Facebook Webhook Payload
export class FacebookWebhookPayloadDto {
  object: string;
  entry: FacebookEntryDto[];
}

// DTO cho cập nhật trạng thái đơn hàng
export class UpdateOrderStatusDto {
  status: string;
}

// DTO cho query params lấy đơn hàng
export class GetOrdersQueryDto {
  limit?: string;
  offset?: string;
}
