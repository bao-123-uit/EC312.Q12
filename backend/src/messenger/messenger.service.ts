/**
 * Messenger Service
 * Xử lý logic chính của Facebook Messenger Bot
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import {
  ConversationState,
  UserSession,
  Product,
  MessengerOrder,
  OrderStatus,
  FacebookWebhookPayload,
  FacebookMessaging,
  QuickReply,
  WebhookOrderPayload,
  PhoneModelInfo,
} from './messenger.types';

// Interface cho Phone Model từ database
interface PhoneModel {
  model_id: number;
  brand_name: string;
  model_name: string;
  model_code?: string;
  is_popular: boolean;
  is_active: boolean;
}

@Injectable()
export class MessengerService {
  private readonly logger = new Logger(MessengerService.name);
  private supabase: SupabaseClient;
  
  // Lưu trữ session của người dùng (trong production nên dùng Redis)
  private userSessions: Map<string, UserSession> = new Map();
  
  // Cache sản phẩm từ database (refresh mỗi 5 phút)
  private productsCache: Product[] = [];
  private productsCacheTime: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 phút

  // Cache phone models
  private phoneModelsCache: PhoneModel[] = [];
  private phoneModelsCacheTime: Date | null = null;

  // Facebook API URL
  private readonly FB_API_URL = 'https://graph.facebook.com/v18.0/me/messages';

  constructor(private configService: ConfigService) {
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SECRET_KEY') ||
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      '';

    // Khởi tạo Supabase client
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL') || '',
      supabaseKey,
    );
    this.logger.log('MessengerService đã được khởi tạo');
    
    // Load sản phẩm từ database khi khởi tạo
    this.loadProductsFromDatabase();
    // Load phone models
    this.loadPhoneModelsFromDatabase();
  }

  /**
   * Lấy sản phẩm từ database với cache
   */
  private async loadProductsFromDatabase(): Promise<Product[]> {
    try {
      // Kiểm tra cache còn hiệu lực không
      if (
        this.productsCache.length > 0 &&
        this.productsCacheTime &&
        Date.now() - this.productsCacheTime.getTime() < this.CACHE_DURATION
      ) {
        return this.productsCache;
      }

      this.logger.log('Đang tải sản phẩm từ database...');

      // Lấy sản phẩm kèm variants để có màu sắc
      const { data, error } = await this.supabase
        .from('products')
        .select(`
          product_id,
          product_name,
          price,
          sale_price,
          description,
          image_url,
          status,
          category_id,
          categories (
            category_id,
            category_name
          )
        `)
        .eq('status', 'active')
        .order('product_name');

      if (error) {
        this.logger.error(`Lỗi lấy sản phẩm: ${error.message}`);
        return this.productsCache; // Trả về cache cũ nếu lỗi
      }

      // Chuyển đổi sang format Product
      const inventoryMap: Record<number, number> = {};

      const productIds = (data || []).map((p: any) => p.product_id);

      const variantsMap: Record<number, string[]> = {};

      const allActiveProducts: Product[] = (data || []).map((p: any): Product => {
          const colors = variantsMap[p.product_id] || [];
          const totalStock = inventoryMap[p.product_id] || 0;

          return {
            id: p.product_id.toString(),
            name: p.product_name,
            price: p.sale_price || p.price,
            emoji: this.getProductEmoji(p.categories?.category_name || ''),
            description: p.description || 'Sản phẩm chất lượng cao',
            colors: colors.length > 0 ? [...new Set(colors)] as string[] : ['Mặc định'],
            image_url: p.image_url,
            stock_quantity: totalStock,
            category_id: p.category_id || p.categories?.category_id,
            category_name: p.categories?.category_name || 'Khác',
          };
        });

      // Ưu tiên hiển thị sản phẩm còn hàng.
      this.productsCache = allActiveProducts;

      this.productsCacheTime = new Date();
      this.logger.log(`Đã tải ${this.productsCache.length} sản phẩm từ database`);

      return this.productsCache;
    } catch (error) {
      this.logger.error(`Lỗi loadProductsFromDatabase: ${error.message}`);
      return this.productsCache;
    }
  }

  /**
   * Lấy phone models từ database với cache
   */
  private async loadPhoneModelsFromDatabase(): Promise<PhoneModel[]> {
    try {
      // Kiểm tra cache còn hiệu lực không
      if (
        this.phoneModelsCache.length > 0 &&
        this.phoneModelsCacheTime &&
        Date.now() - this.phoneModelsCacheTime.getTime() < this.CACHE_DURATION
      ) {
        return this.phoneModelsCache;
      }

      this.logger.log('Đang tải phone models từ database...');

      const { data, error } = await this.supabase
        .from('phone_models')
        .select('model_id, brand_name, model_name, model_code, is_popular, is_active')
        .eq('is_active', true)
        .order('is_popular', { ascending: false })
        .order('brand_name')
        .order('model_name');

      if (error) {
        this.logger.error(`Lỗi lấy phone models: ${error.message}`);
        return this.phoneModelsCache;
      }

      this.phoneModelsCache = data || [];
      this.phoneModelsCacheTime = new Date();
      this.logger.log(`Đã tải ${this.phoneModelsCache.length} phone models từ database`);

      return this.phoneModelsCache;
    } catch (error) {
      this.logger.error(`Lỗi loadPhoneModelsFromDatabase: ${error.message}`);
      return this.phoneModelsCache;
    }
  }

  /**
   * Lấy danh sách brands từ phone models
   */
  private async getPhoneBrands(): Promise<string[]> {
    const models = await this.loadPhoneModelsFromDatabase();
    const brands = [...new Set(models.map(m => m.brand_name))];
    return brands;
  }

  /**
   * Lấy phone models theo brand
   */
  private async getPhoneModelsByBrand(brandName: string): Promise<PhoneModel[]> {
    const models = await this.loadPhoneModelsFromDatabase();
    return models.filter(m => m.brand_name.toLowerCase() === brandName.toLowerCase());
  }

  /**
   * Lấy danh sách phone models (public API)
   */
  async getPhoneModelList(): Promise<{ brand: string; models: PhoneModel[] }[]> {
    const models = await this.loadPhoneModelsFromDatabase();
    
    // Group by brand
    const groupedByBrand: { [key: string]: PhoneModel[] } = {};
    models.forEach((model) => {
      if (!groupedByBrand[model.brand_name]) {
        groupedByBrand[model.brand_name] = [];
      }
      groupedByBrand[model.brand_name].push(model);
    });

    // Convert to array format
    return Object.entries(groupedByBrand).map(([brand, brandModels]) => ({
      brand,
      models: brandModels,
    }));
  }

  /**
   * Lấy emoji theo category
   */
  private getProductEmoji(categoryName: string): string {
    const emojiMap: Record<string, string> = {
      'Ốp lưng': '📱',
      'Ốp điện thoại': '📱',
      'Phụ kiện': '🎧',
      'Sạc': '🔌',
      'Cáp': '🔗',
      'Tai nghe': '🎧',
      'Bao da': '👜',
      'Kính cường lực': '✨',
      'Giá đỡ': '📐',
    };
    
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return emoji;
      }
    }
    return '📦'; // Default emoji
  }

  /**
   * Lấy danh sách sản phẩm (public)
   */
  async getProducts(): Promise<Product[]> {
    return this.loadProductsFromDatabase();
  }

  /**
   * Xác minh webhook từ Facebook
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = this.configService.get('FACEBOOK_VERIFY_TOKEN');
    
    this.logger.log(`Xác minh webhook - Mode: ${mode}, Token: ${token}`);
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('Webhook đã được xác minh thành công!');
      return challenge;
    }
    
    this.logger.warn('Xác minh webhook thất bại!');
    return null;
  }

  /**
   * Xử lý webhook event từ Facebook
   */
  async handleWebhook(payload: FacebookWebhookPayload): Promise<void> {
    try {
      this.logger.log(`Nhận webhook: ${JSON.stringify(payload)}`);

      if (payload.object !== 'page') {
        this.logger.warn('Không phải page event, bỏ qua');
        return;
      }

      // Xử lý từng entry
      for (const entry of payload.entry) {
        for (const event of entry.messaging) {
          await this.processMessagingEvent(event);
        }
      }
    } catch (error) {
      this.logger.error(`Lỗi xử lý webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Xử lý từng messaging event
   */
  private async processMessagingEvent(event: FacebookMessaging): Promise<void> {
    const senderId = event.sender.id;
    
    this.logger.log(`Xử lý event từ user: ${senderId}`);

    // Xử lý postback (khi user click button)
    if (event.postback) {
      await this.handlePostback(senderId, event.postback.payload);
      return;
    }

    // Xử lý tin nhắn
    if (event.message) {
      // Xử lý quick reply
      if (event.message.quick_reply) {
        await this.handleQuickReply(senderId, event.message.quick_reply.payload);
        return;
      }

      // Xử lý tin nhắn text thông thường
      if (event.message.text) {
        await this.handleTextMessage(senderId, event.message.text);
        return;
      }
    }
  }

  /**
   * Xử lý postback (button clicks)
   */
  private async handlePostback(senderId: string, payload: string): Promise<void> {
    this.logger.log(`Postback từ ${senderId}: ${payload}`);

    switch (payload) {
      case 'GET_STARTED':
        await this.sendWelcomeMessage(senderId);
        break;
      case 'VIEW_PRODUCTS':
        await this.sendCategoryList(senderId);
        break;
      case 'VIEW_ORDERS':
        await this.sendOrderHistory(senderId);
        break;
      case 'CONTACT_SUPPORT':
        await this.sendSupportInfo(senderId);
        break;
      default:
        // Xử lý chọn danh mục
        if (payload.startsWith('CATEGORY_')) {
          const categoryId = payload.replace('CATEGORY_', '');
          if (categoryId === 'ALL') {
            await this.sendProductListByCategory(senderId);
          } else {
            await this.sendProductListByCategory(senderId, parseInt(categoryId));
          }
        }
        // Xử lý chọn sản phẩm
        else if (payload.startsWith('PRODUCT_')) {
          const productId = payload.replace('PRODUCT_', '');
          await this.handleProductSelection(senderId, productId);
        }
        // Quay lại danh mục
        else if (payload === 'BACK_TO_CATEGORY') {
          await this.sendCategoryList(senderId);
        }
        break;
    }
  }

  /**
   * Xử lý quick reply
   */
  private async handleQuickReply(senderId: string, payload: string): Promise<void> {
    this.logger.log(`Quick reply từ ${senderId}: ${payload}`);

    // Xử lý xác nhận đơn hàng
    if (payload === 'CONFIRM_ORDER') {
      await this.confirmOrder(senderId);
      return;
    }
    if (payload === 'CANCEL_ORDER') {
      await this.cancelOrder(senderId);
      return;
    }

    // Xử lý chọn danh mục
    if (payload.startsWith('CATEGORY_')) {
      const categoryId = payload.replace('CATEGORY_', '');
      if (categoryId === 'ALL') {
        await this.sendProductListByCategory(senderId);
      } else {
        await this.sendProductListByCategory(senderId, parseInt(categoryId));
      }
      return;
    }

    // Xử lý quay lại danh mục
    if (payload === 'BACK_TO_CATEGORY') {
      await this.sendCategoryList(senderId);
      return;
    }

    // Xử lý chọn sản phẩm
    if (payload.startsWith('PRODUCT_')) {
      const productId = payload.replace('PRODUCT_', '');
      await this.handleProductSelection(senderId, productId);
      return;
    }

    // Xử lý chọn màu sắc
    if (payload.startsWith('COLOR_')) {
      const color = payload.replace('COLOR_', '');
      await this.handleColorSelection(senderId, color);
      return;
    }

    // Xử lý chọn brand điện thoại
    if (payload.startsWith('BRAND_')) {
      const brand = payload.replace('BRAND_', '');
      await this.handleBrandSelection(senderId, brand);
      return;
    }

    // Xử lý chọn dòng máy điện thoại
    if (payload.startsWith('PHONEMODEL_')) {
      const modelId = payload.replace('PHONEMODEL_', '');
      await this.handlePhoneModelSelection(senderId, parseInt(modelId));
      return;
    }

    // Xử lý menu sản phẩm
    if (payload === 'MENU_PRODUCTS' || payload === 'VIEW_PRODUCTS') {
      await this.sendCategoryList(senderId);
      return;
    }

    // Xử lý xem đơn hàng
    if (payload === 'VIEW_ORDERS') {
      await this.sendOrderHistory(senderId);
      return;
    }

    // Xử lý hỗ trợ
    if (payload === 'CONTACT_SUPPORT') {
      await this.sendSupportInfo(senderId);
      return;
    }

    // Xử lý menu
    if (payload === 'MENU') {
      await this.sendMainMenu(senderId);
      return;
    }
  }

  /**
   * Xử lý tin nhắn text
   */
  private async handleTextMessage(senderId: string, text: string): Promise<void> {
    const normalizedText = text.toLowerCase().trim();
    this.logger.log(`Tin nhắn từ ${senderId}: ${text}`);

    // Lấy session hiện tại của user
    const session = this.getUserSession(senderId);

    // Xử lý các lệnh cơ bản
    if (['menu', 'hi', 'hello', 'xin chào', 'chào', 'start', 'bắt đầu'].includes(normalizedText)) {
      await this.sendWelcomeMessage(senderId);
      return;
    }

    if (['sản phẩm', 'xem sản phẩm', 'mua hàng', 'products'].includes(normalizedText)) {
      await this.sendCategoryList(senderId);
      return;
    }

    if (['đơn hàng', 'xem đơn', 'orders', 'lịch sử'].includes(normalizedText)) {
      await this.sendOrderHistory(senderId);
      return;
    }

    if (['hỗ trợ', 'support', 'liên hệ', 'contact'].includes(normalizedText)) {
      await this.sendSupportInfo(senderId);
      return;
    }

    if (['hủy', 'cancel', 'bỏ', 'dừng'].includes(normalizedText)) {
      await this.cancelOrder(senderId);
      return;
    }

    // Xử lý theo trạng thái conversation
    switch (session.state) {
      case ConversationState.WAITING_PRODUCT: {
        // Cho phép chọn sản phẩm bằng số thứ tự
        const allProducts = await this.loadProductsFromDatabase();
        let products = allProducts;
        // Nếu vừa chọn danh mục, lọc theo danh mục
        if (session.selectedCategory && typeof session.selectedCategory.id === 'number') {
          products = allProducts.filter((p) => p.category_id === session.selectedCategory!.id);
        }
        const idx = parseInt(text.trim(), 10);
        if (!isNaN(idx) && idx >= 1 && idx <= products.length) {
          const product = products[idx - 1];
          await this.handleProductSelection(senderId, product.id);
          break;
        }
        // Nếu không phải số thứ tự, gửi lại danh sách
        await this.sendMessage(senderId, { text: 'Vui lòng nhập số thứ tự sản phẩm hoặc chọn bên dưới!' });
        await this.sendProductListByCategory(senderId, session.selectedCategory?.id);
        break;
      }
      case ConversationState.WAITING_QUANTITY:
        await this.handleQuantityInput(senderId, text);
        break;
      case ConversationState.WAITING_NAME:
        await this.handleNameInput(senderId, text);
        break;
      case ConversationState.WAITING_PHONE:
        await this.handlePhoneInput(senderId, text);
        break;
      case ConversationState.WAITING_ADDRESS:
        await this.handleAddressInput(senderId, text);
        break;
      case ConversationState.WAITING_CONFIRM:
        await this.handleConfirmInput(senderId, text);
        break;
      default:
        // Không hiểu tin nhắn, gửi menu
        await this.sendUnknownMessage(senderId);
        break;
    }
  }

  /**
   * Gửi tin nhắn chào mừng
   */
  private async sendWelcomeMessage(senderId: string): Promise<void> {
    // Reset session
    this.resetUserSession(senderId);

    const welcomeText = `Xin chào! 👋 Chào mừng bạn đến với Cửa hàng Ốp điện thoại & Phụ kiện! 📱

🛍️ Chúng tôi chuyên cung cấp:
• Ốp lưng điện thoại cao cấp
• Phụ kiện chính hãng
• Giá cả hợp lý, chất lượng đảm bảo

Bạn muốn làm gì hôm nay?`;

    await this.sendMessage(senderId, { text: welcomeText });
    await this.sendMainMenu(senderId);
  }

  /**
   * Gửi menu chính
   */
  private async sendMainMenu(senderId: string): Promise<void> {
    const quickReplies: QuickReply[] = [
      { content_type: 'text', title: '📱 Xem sản phẩm', payload: 'MENU_PRODUCTS' },
      { content_type: 'text', title: '📦 Đơn hàng của tôi', payload: 'VIEW_ORDERS' },
      { content_type: 'text', title: '💬 Hỗ trợ', payload: 'CONTACT_SUPPORT' },
    ];

    await this.sendMessage(senderId, {
      text: 'Chọn một trong các tùy chọn bên dưới:',
      quick_replies: quickReplies,
    });
  }

  /**
   * Gửi danh sách danh mục
   */
  private async sendCategoryList(senderId: string): Promise<void> {
    // Cập nhật trạng thái
    this.updateUserSession(senderId, { state: ConversationState.WAITING_CATEGORY });

    // Lấy sản phẩm từ database
    const products = await this.loadProductsFromDatabase();

    if (products.length === 0) {
      await this.sendMessage(senderId, {
        text: '😔 Hiện tại chưa có sản phẩm nào. Vui lòng quay lại sau!',
      });
      await this.sendMainMenu(senderId);
      return;
    }

    // Lấy danh sách danh mục unique
    const categoriesMap = new Map<number, string>();
    products.forEach((p) => {
      if (p.category_id && p.category_name) {
        categoriesMap.set(p.category_id, p.category_name);
      }
    });

    const categories = Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));

    if (categories.length === 0) {
      // Nếu không có danh mục, gửi tất cả sản phẩm
      await this.sendProductList(senderId);
      return;
    }

    // Giới hạn 10 danh mục (Facebook quick reply tối đa 13)
    const displayCategories = categories.slice(0, 10);

    const categoryText = ` DANH MỤC SẢN PHẨM 

${displayCategories.map((c, i) => `${i + 1}.  ${c.name}`).join('\n')}

Chọn danh mục bạn muốn xem:`;

    const quickReplies: QuickReply[] = displayCategories.map((c) => ({
      content_type: 'text' as const,
      title: this.truncateText(` ${c.name}`, 20),
      payload: `CATEGORY_${c.id}`,
    }));

    // Thêm nút "Xem tất cả"
    quickReplies.push({
      content_type: 'text' as const,
      title: '📋 Xem tất cả',
      payload: 'CATEGORY_ALL',
    });

    await this.sendMessage(senderId, {
      text: categoryText,
      quick_replies: quickReplies,
    });
  }

  /**
   * Gửi danh sách sản phẩm theo danh mục
   */
  private async sendProductListByCategory(senderId: string, categoryId?: number): Promise<void> {
    // Cập nhật trạng thái và selectedCategory
    if (categoryId) {
      // Lấy tên danh mục
      const allProducts = await this.loadProductsFromDatabase();
      const productInCat = allProducts.find((p) => p.category_id === categoryId);
      const catName = productInCat?.category_name || 'Danh mục';
      this.updateUserSession(senderId, { state: ConversationState.WAITING_PRODUCT, selectedCategory: { id: categoryId, name: catName } });
    } else {
      // Xem tất cả: xóa selectedCategory
      this.updateUserSession(senderId, { state: ConversationState.WAITING_PRODUCT, selectedCategory: undefined });
    }

    // Lấy sản phẩm từ database
    const allProducts = await this.loadProductsFromDatabase();

    // Lọc theo danh mục nếu có
    const products = categoryId 
      ? allProducts.filter((p) => p.category_id === categoryId)
      : allProducts;

    if (products.length === 0) {
      await this.sendMessage(senderId, {
        text: '😔 Danh mục này chưa có sản phẩm. Vui lòng chọn danh mục khác!',
      });
      await this.sendCategoryList(senderId);
      return;
    }

    const categoryName = categoryId 
      ? products[0]?.category_name || 'Danh mục'
      : 'TẤT CẢ';

    // Hiển thị TẤT CẢ sản phẩm trong text
    const productText = `📱 SẢN PHẨM - ${categoryName} 📱

${products.map((p, i) => `${i + 1}. ${p.emoji} ${p.name} - ${this.formatPrice(p.price)}`).join('\n')}

Chọn sản phẩm bạn muốn mua (nhập số thứ tự hoặc chọn bên dưới):`;

    // Quick replies chỉ hiển thị tối đa 10 (giới hạn Facebook là 13)
    const displayProducts = products.slice(0, 10);

    // Rút gọn tên nếu quá dài (Facebook giới hạn 20 ký tự cho title)
    const quickReplies: QuickReply[] = displayProducts.map((p) => ({
      content_type: 'text' as const,
      title: this.truncateText(`${p.emoji} ${p.name}`, 20),
      payload: `PRODUCT_${p.id}`,
    }));

    // Thêm nút quay lại danh mục
    quickReplies.push({
      content_type: 'text' as const,
      title: '⬅️ Quay lại',
      payload: 'BACK_TO_CATEGORY',
    });

    await this.sendMessage(senderId, {
      text: productText,
      quick_replies: quickReplies,
    });
  }

  /**
   * Gửi danh sách sản phẩm (giữ lại cho tương thích)
   */
  private async sendProductList(senderId: string): Promise<void> {
    // Cập nhật trạng thái
    this.updateUserSession(senderId, { state: ConversationState.WAITING_PRODUCT });

    // Lấy sản phẩm từ database
    const products = await this.loadProductsFromDatabase();

    if (products.length === 0) {
      await this.sendMessage(senderId, {
        text: '😔 Hiện tại chưa có sản phẩm nào. Vui lòng quay lại sau!',
      });
      await this.sendMainMenu(senderId);
      return;
    }

    // Giới hạn 10 sản phẩm (Facebook quick reply tối đa 13)
    const displayProducts = products.slice(0, 10);

    const productText = `📱 DANH SÁCH SẢN PHẨM 📱

${displayProducts.map((p, i) => `${i + 1}. ${p.emoji} ${p.name} - ${this.formatPrice(p.price)}`).join('\n')}

${products.length > 10 ? `\n📌 Hiển thị ${displayProducts.length}/${products.length} sản phẩm. Chọn danh mục để xem thêm!\n` : ''}
Chọn sản phẩm bạn muốn mua:`;

    // Rút gọn tên nếu quá dài (Facebook giới hạn 20 ký tự cho title)
    const quickReplies: QuickReply[] = displayProducts.map((p) => ({
      content_type: 'text' as const,
      title: this.truncateText(`${p.emoji} ${p.name}`, 20),
      payload: `PRODUCT_${p.id}`,
    }));

    await this.sendMessage(senderId, {
      text: productText,
      quick_replies: quickReplies,
    });
  }

  /**
   * Rút gọn text nếu quá dài
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Xử lý khi khách chọn sản phẩm
   */
  private async handleProductSelection(senderId: string, productId: string): Promise<void> {
    const products = await this.loadProductsFromDatabase();
    const product = products.find((p) => p.id === productId);
    
    if (!product) {
      await this.sendMessage(senderId, { text: '❌ Sản phẩm không tồn tại. Vui lòng chọn lại.' });
      await this.sendCategoryList(senderId);
      return;
    }

    // Lưu sản phẩm đã chọn
    this.updateUserSession(senderId, {
      selectedProduct: product,
      state: ConversationState.WAITING_PHONE_MODEL,
    });

    this.logger.log(`User ${senderId} đã chọn sản phẩm: ${product.name}`);

    // Gửi thông tin sản phẩm và hỏi chọn dòng máy
    const productInfo = `✅ Bạn đã chọn: ${product.emoji} ${product.name}
💰 Giá: ${this.formatPrice(product.price)}
📝 Mô tả: ${product.description}

📱 Vui lòng chọn HÃNG điện thoại của bạn:`;

    // Lấy danh sách brands
    const brands = await this.getPhoneBrands();
    
    if (brands.length === 0) {
      // Nếu không có phone models trong database, bỏ qua bước này
      this.updateUserSession(senderId, {
        state: ConversationState.WAITING_COLOR,
      });
      await this.sendColorSelection(senderId, product);
      return;
    }

    // Giới hạn 10 brands (Facebook quick reply tối đa 13)
    const displayBrands = brands.slice(0, 10);
    
    const brandReplies: QuickReply[] = displayBrands.map((brand) => ({
      content_type: 'text' as const,
      title: this.getBrandEmoji(brand) + ' ' + this.truncateText(brand, 17),
      payload: `BRAND_${brand}`,
    }));

    await this.sendMessage(senderId, {
      text: productInfo,
      quick_replies: brandReplies,
    });
  }

  /**
   * Lấy emoji cho brand điện thoại
   */
  private getBrandEmoji(brand: string): string {
    const emojiMap: Record<string, string> = {
      'Apple': '🍎',
      'Samsung': '📱',
      'Xiaomi': '🔷',
      'OPPO': '💚',
      'Vivo': '💙',
      'Realme': '💛',
      'Huawei': '🔴',
      'OnePlus': '🔴',
      'Google': '🔵',
      'Sony': '⚫',
    };
    return emojiMap[brand] || '📱';
  }

  /**
   * Xử lý khi khách chọn brand điện thoại
   */
  private async handleBrandSelection(senderId: string, brandName: string): Promise<void> {
    this.logger.log(`User ${senderId} đã chọn brand: ${brandName}`);

    const models = await this.getPhoneModelsByBrand(brandName);
    
    if (models.length === 0) {
      await this.sendMessage(senderId, { 
        text: `❌ Không tìm thấy dòng máy cho ${brandName}. Vui lòng chọn hãng khác.` 
      });
      // Gửi lại danh sách brands
      const brands = await this.getPhoneBrands();
      const brandReplies: QuickReply[] = brands.slice(0, 10).map((brand) => ({
        content_type: 'text' as const,
        title: this.getBrandEmoji(brand) + ' ' + this.truncateText(brand, 17),
        payload: `BRAND_${brand}`,
      }));
      await this.sendMessage(senderId, {
        text: '📱 Chọn hãng điện thoại:',
        quick_replies: brandReplies,
      });
      return;
    }

    // Giới hạn 10 models (Facebook quick reply tối đa 13)
    const displayModels = models.slice(0, 10);
    
    const modelText = `📱 Dòng máy ${brandName}:

${displayModels.map((m, i) => `${i + 1}. ${m.model_name}${m.is_popular ? ' ⭐' : ''}`).join('\n')}

Chọn dòng máy của bạn:`;

    const modelReplies: QuickReply[] = displayModels.map((model) => ({
      content_type: 'text' as const,
      title: this.truncateText(model.model_name, 20),
      payload: `PHONEMODEL_${model.model_id}`,
    }));

    await this.sendMessage(senderId, {
      text: modelText,
      quick_replies: modelReplies,
    });
  }

  /**
   * Xử lý khi khách chọn dòng máy điện thoại
   */
  private async handlePhoneModelSelection(senderId: string, modelId: number): Promise<void> {
    const models = await this.loadPhoneModelsFromDatabase();
    const selectedModel = models.find(m => m.model_id === modelId);
    
    if (!selectedModel) {
      await this.sendMessage(senderId, { text: '❌ Dòng máy không tồn tại. Vui lòng chọn lại.' });
      return;
    }

    // Lưu dòng máy đã chọn
    this.updateUserSession(senderId, {
      selectedPhoneModel: {
        model_id: selectedModel.model_id,
        brand_name: selectedModel.brand_name,
        model_name: selectedModel.model_name,
      },
      state: ConversationState.WAITING_COLOR,
    });

    this.logger.log(`User ${senderId} đã chọn dòng máy: ${selectedModel.brand_name} ${selectedModel.model_name}`);

    // Chuyển sang chọn màu
    const session = this.getUserSession(senderId);
    if (session.selectedProduct) {
      await this.sendMessage(senderId, {
        text: `✅ Dòng máy: ${selectedModel.brand_name} ${selectedModel.model_name}`,
      });
      await this.sendColorSelection(senderId, session.selectedProduct);
    }
  }

  /**
   * Gửi lựa chọn màu sắc
   */
  private async sendColorSelection(senderId: string, product: Product): Promise<void> {
    const colorText = `🎨 Vui lòng chọn màu sắc:`;

    const colorReplies: QuickReply[] = (product.colors || []).map((color) => ({
      content_type: 'text' as const,
      title: color,
      payload: `COLOR_${color}`,
    }));

    await this.sendMessage(senderId, {
      text: colorText,
      quick_replies: colorReplies,
    });
  }

  /**
   * Xử lý khi khách chọn màu sắc
   */
  private async handleColorSelection(senderId: string, color: string): Promise<void> {
    this.updateUserSession(senderId, {
      color: color,
      state: ConversationState.WAITING_QUANTITY,
    });

    this.logger.log(`User ${senderId} đã chọn màu: ${color}`);

    await this.sendMessage(senderId, {
      text: `🎨 Màu sắc: ${color}\n\n📦 Vui lòng nhập số lượng bạn muốn mua (1-99):`,
    });
  }

  /**
   * Xử lý nhập số lượng
   */
  private async handleQuantityInput(senderId: string, text: string): Promise<void> {
    const quantity = parseInt(text.trim(), 10);

    // Validate số lượng
    if (isNaN(quantity) || quantity < 1 || quantity > 99) {
      await this.sendMessage(senderId, {
        text: '❌ Số lượng không hợp lệ. Vui lòng nhập số từ 1 đến 99:',
      });
      return;
    }

    this.updateUserSession(senderId, {
      quantity: quantity,
      state: ConversationState.WAITING_NAME,
    });

    this.logger.log(`User ${senderId} đã nhập số lượng: ${quantity}`);

    await this.sendMessage(senderId, {
      text: `📦 Số lượng: ${quantity}\n\n👤 Vui lòng nhập HỌ VÀ TÊN người nhận hàng:`,
    });
  }

  /**
   * Xử lý nhập tên
   */
  private async handleNameInput(senderId: string, text: string): Promise<void> {
    const name = text.trim();

    // Validate tên
    if (name.length < 2 || name.length > 100) {
      await this.sendMessage(senderId, {
        text: '❌ Tên không hợp lệ. Vui lòng nhập họ tên đầy đủ (2-100 ký tự):',
      });
      return;
    }

    this.updateUserSession(senderId, {
      customerName: name,
      state: ConversationState.WAITING_PHONE,
    });

    this.logger.log(`User ${senderId} đã nhập tên: ${name}`);

    await this.sendMessage(senderId, {
      text: `👤 Tên: ${name}\n\n📞 Vui lòng nhập SỐ ĐIỆN THOẠI liên hệ (10-11 số):`,
    });
  }

  /**
   * Xử lý nhập số điện thoại
   */
  private async handlePhoneInput(senderId: string, text: string): Promise<void> {
    const phone = text.replace(/\s/g, '').trim();

    // Validate số điện thoại Việt Nam
    const phoneRegex = /^(0|84|\+84)?[3-9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      await this.sendMessage(senderId, {
        text: '❌ Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (VD: 0912345678):',
      });
      return;
    }

    // Chuẩn hóa số điện thoại
    let normalizedPhone = phone;
    if (phone.startsWith('+84')) {
      normalizedPhone = '0' + phone.slice(3);
    } else if (phone.startsWith('84')) {
      normalizedPhone = '0' + phone.slice(2);
    }

    this.updateUserSession(senderId, {
      phone: normalizedPhone,
      state: ConversationState.WAITING_ADDRESS,
    });

    this.logger.log(`User ${senderId} đã nhập SĐT: ${normalizedPhone}`);

    await this.sendMessage(senderId, {
      text: `📞 SĐT: ${normalizedPhone}\n\n🏠 Vui lòng nhập ĐỊA CHỈ giao hàng chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố):`,
    });
  }

  /**
   * Xử lý nhập địa chỉ
   */
  private async handleAddressInput(senderId: string, text: string): Promise<void> {
    const address = text.trim();

    // Validate địa chỉ
    if (address.length < 10 || address.length > 500) {
      await this.sendMessage(senderId, {
        text: '❌ Địa chỉ không hợp lệ. Vui lòng nhập địa chỉ chi tiết hơn (10-500 ký tự):',
      });
      return;
    }

    this.updateUserSession(senderId, {
      address: address,
      state: ConversationState.WAITING_CONFIRM,
    });

    this.logger.log(`User ${senderId} đã nhập địa chỉ: ${address}`);

    // Hiển thị xác nhận đơn hàng
    await this.sendOrderConfirmation(senderId);
  }

  /**
   * Gửi xác nhận đơn hàng
   */
  private async sendOrderConfirmation(senderId: string): Promise<void> {
    const session = this.getUserSession(senderId);
    const totalPrice = (session.selectedProduct?.price || 0) * (session.quantity || 0);

    // Tạo chuỗi hiển thị dòng máy nếu có
    const phoneModelText = session.selectedPhoneModel 
      ? `📱 Dòng máy: ${session.selectedPhoneModel.brand_name} ${session.selectedPhoneModel.model_name}\n` 
      : '';

    const confirmText = `📋 XÁC NHẬN ĐƠN HÀNG 📋
━━━━━━━━━━━━━━━━━━━━━

📱 Sản phẩm: ${session.selectedProduct?.emoji} ${session.selectedProduct?.name}
${phoneModelText}🎨 Màu sắc: ${session.color}
📦 Số lượng: ${session.quantity}
💰 Đơn giá: ${this.formatPrice(session.selectedProduct?.price || 0)}

━━━━━━━━━━━━━━━━━━━━━
💵 TỔNG TIỀN: ${this.formatPrice(totalPrice)}
━━━━━━━━━━━━━━━━━━━━━

👤 Người nhận: ${session.customerName}
📞 Điện thoại: ${session.phone}
🏠 Địa chỉ: ${session.address}

━━━━━━━━━━━━━━━━━━━━━
🚚 Phí ship: MIỄN PHÍ
💳 Thanh toán: Khi nhận hàng (COD)

Bạn xác nhận đặt hàng?`;

    const quickReplies: QuickReply[] = [
      { content_type: 'text', title: '✅ Xác nhận đặt hàng', payload: 'CONFIRM_ORDER' },
      { content_type: 'text', title: '❌ Hủy đơn', payload: 'CANCEL_ORDER' },
    ];

    await this.sendMessage(senderId, {
      text: confirmText,
      quick_replies: quickReplies,
    });
  }

  /**
   * Xử lý input xác nhận (text)
   */
  private async handleConfirmInput(senderId: string, text: string): Promise<void> {
    const normalizedText = text.toLowerCase().trim();

    if (['có', 'yes', 'ok', 'đồng ý', 'xác nhận', 'confirm'].includes(normalizedText)) {
      await this.confirmOrder(senderId);
    } else if (['không', 'no', 'hủy', 'cancel', 'bỏ'].includes(normalizedText)) {
      await this.cancelOrder(senderId);
    } else {
      await this.sendMessage(senderId, {
        text: 'Vui lòng chọn "Xác nhận đặt hàng" hoặc "Hủy đơn"',
      });
      await this.sendOrderConfirmation(senderId);
    }
  }

  /**
   * Xác nhận và lưu đơn hàng
   */
  private async confirmOrder(senderId: string): Promise<void> {
    const session = this.getUserSession(senderId);

    // Kiểm tra session có đủ thông tin không
    if (!session.selectedProduct || !session.customerName || !session.phone || !session.address) {
      await this.sendMessage(senderId, {
        text: '❌ Thông tin đơn hàng không đầy đủ. Vui lòng bắt đầu lại.',
      });
      await this.sendCategoryList(senderId);
      return;
    }

    try {
      const totalPrice = (session.selectedProduct.price || 0) * (session.quantity || 0);

      // Tạo đơn hàng
      const order: MessengerOrder = {
        facebook_user_id: senderId,
        customer_name: session.customerName,
        phone: session.phone,
        address: session.address,
        product_name: session.selectedProduct.name,
        product_price: session.selectedProduct.price,
        quantity: session.quantity || 1,
        color: session.color,
        phone_model_id: session.selectedPhoneModel?.model_id,
        phone_model_name: session.selectedPhoneModel 
          ? `${session.selectedPhoneModel.brand_name} ${session.selectedPhoneModel.model_name}` 
          : undefined,
        total_price: totalPrice,
        status: OrderStatus.PENDING,
      };

      // Lưu vào Supabase (bảng orders chính)
      const savedOrder = await this.saveOrderToSupabase(order);
      this.logger.log(`Đã lưu đơn hàng: ${JSON.stringify(savedOrder)}`);

      // Gửi webhook đến hệ thống quản lý
      await this.sendWebhookToAdmin(order, savedOrder?.order_number || savedOrder?.id);

      // Gửi thông báo thành công
      await this.sendMessage(senderId, {
        text: `🎉 ĐẶT HÀNG THÀNH CÔNG! 🎉
━━━━━━━━━━━━━━━━━━━━━

📦 Mã đơn hàng: #${savedOrder?.order_number || savedOrder?.id || 'N/A'}
💵 Tổng tiền: ${this.formatPrice(totalPrice)}

📞 Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 30 phút!

🚚 Dự kiến giao hàng: 2-3 ngày

Cảm ơn bạn đã mua hàng! ❤️`,
      });

      // Reset session
      this.resetUserSession(senderId);

      // Gửi menu tiếp tục mua hàng
      await this.sendMessage(senderId, {
        text: 'Bạn có muốn tiếp tục mua sắm không?',
        quick_replies: [
          { content_type: 'text', title: '📱 Xem sản phẩm', payload: 'MENU_PRODUCTS' },
          { content_type: 'text', title: '📦 Xem đơn hàng', payload: 'VIEW_ORDERS' },
        ],
      });
    } catch (error) {
      this.logger.error(`Lỗi lưu đơn hàng: ${error.message}`, error.stack);
      await this.sendMessage(senderId, {
        text: '❌ Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau hoặc liên hệ hotline: 0123456789',
      });
    }
  }

  /**
   * Hủy đơn hàng
   */
  private async cancelOrder(senderId: string): Promise<void> {
    this.resetUserSession(senderId);

    await this.sendMessage(senderId, {
      text: '❌ Đã hủy đơn hàng.\n\nBạn có thể tiếp tục mua sắm bất cứ lúc nào!',
    });

    await this.sendMainMenu(senderId);
  }

  /**
   * Tạo mã đơn hàng duy nhất
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MSG${dateStr}${random}`;
  }

  /**
   * Lưu đơn hàng vào bảng orders chính của hệ thống
   */
  private async saveOrderToSupabase(order: MessengerOrder): Promise<any> {
    try {
      const session = this.getUserSession(order.facebook_user_id);
      const orderNumber = this.generateOrderNumber();

      // 1. Tạo đơn hàng trong bảng orders chính
      const { data: orderData, error: orderError } = await this.supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            // customer_id để null vì khách từ Messenger chưa có tài khoản
            // Facebook ID được lưu trong customer_note để tra cứu
            subtotal: order.total_price,
            discount_amount: 0,
            shipping_fee: 0,
            total_amount: order.total_price,
            payment_method: 'cod', // Thanh toán khi nhận hàng
            order_status: 'pending',
            payment_status: 'unpaid',
            shipping_full_name: order.customer_name,
            shipping_phone: order.phone,
            shipping_address: order.address,
            // Lưu Facebook ID ở đầu để dễ tra cứu
            customer_note: `[FB:${order.facebook_user_id}] ${order.customer_name} - ${order.phone}${order.phone_model_name ? ` | Dòng máy: ${order.phone_model_name}` : ''}${order.color ? ` | Màu: ${order.color}` : ''}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (orderError) {
        this.logger.error(`Lỗi tạo order: ${orderError.message}`);
        throw orderError;
      }

      this.logger.log(`Đã tạo đơn hàng #${orderData.order_id}`);

      // 2. Tạo order_items
      const { data: itemData, error: itemError } = await this.supabase
        .from('order_items')
        .insert([
          {
            order_id: orderData.order_id,
            product_id: parseInt(session.selectedProduct?.id || '0', 10),
            product_name: order.product_name,
            variant_name: order.color || null, // Lưu màu vào variant_name
            phone_model_id: order.phone_model_id || null,
            phone_model_name: order.phone_model_name || null,
            sku: `MSG-${Date.now()}`, // SKU tạm
            quantity: order.quantity,
            unit_price: order.product_price,
            discount_amount: 0,
            total_price: order.total_price,
          },
        ])
        .select();

      if (itemError) {
        this.logger.error(`Lỗi tạo order_item: ${itemError.message}`);
        // Không throw, vẫn tiếp tục
      }

      // 3. Cập nhật stock sản phẩm
      if (session.selectedProduct?.id) {
        const productId = parseInt(session.selectedProduct.id, 10);
        const { error: stockError } = await this.supabase.rpc('decrement_stock', {
          p_product_id: productId,
          p_quantity: order.quantity,
        });
        
        if (stockError) {
          this.logger.warn(`Không thể giảm stock: ${stockError.message}`);
          // Thử cách khác nếu function không tồn tại
          const { data: product } = await this.supabase
            .from('products')
            .select('stock_quantity')
            .eq('product_id', productId)
            .single();
          
          if (product) {
            await this.supabase
              .from('products')
              .update({ stock_quantity: Math.max(0, product.stock_quantity - order.quantity) })
              .eq('product_id', productId);
          }
        }
      }

      // Clear cache để lấy stock mới
      this.productsCacheTime = null;

      return {
        id: orderData.order_id,
        order_number: orderNumber,
        ...orderData,
      };
    } catch (error) {
      this.logger.error(`Lỗi lưu đơn hàng: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gửi webhook đến hệ thống quản lý với retry logic
   */
  private async sendWebhookToAdmin(order: MessengerOrder, orderId?: string): Promise<void> {
    const webhookUrl = this.configService.get('WEBHOOK_URL');
    
    if (!webhookUrl) {
      this.logger.warn('WEBHOOK_URL chưa được cấu hình');
      return;
    }

    const payload: WebhookOrderPayload = {
      customer_name: order.customer_name,
      phone: order.phone,
      address: order.address,
      product: order.product_name,
      quantity: order.quantity,
      color: order.color,
      notes: order.notes,
      total_price: order.total_price,
      facebook_user_id: order.facebook_user_id,
      order_id: orderId,
      created_at: new Date().toISOString(),
    };

    // Retry 3 lần
    const maxRetries = 3;
    const retryDelay = 2000; // 2 giây

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Gửi webhook (lần ${attempt}/${maxRetries}): ${webhookUrl}`);
        
        const response = await axios.post(webhookUrl, payload, {
          timeout: 5000, // 5 giây timeout
          headers: {
            'Content-Type': 'application/json',
          },
        });

        this.logger.log(`Webhook thành công: ${response.status}`);
        return;
      } catch (error) {
        this.logger.error(`Webhook thất bại (lần ${attempt}/${maxRetries}): ${error.message}`);
        
        if (attempt < maxRetries) {
          this.logger.log(`Chờ ${retryDelay}ms trước khi thử lại...`);
          await this.delay(retryDelay);
        }
      }
    }

    this.logger.error(`Webhook thất bại sau ${maxRetries} lần thử!`);
  }

  /**
   * Gửi lịch sử đơn hàng (lấy từ bảng orders chính)
   */
  private async sendOrderHistory(senderId: string): Promise<void> {
    try {
      // Tìm đơn hàng theo ghi chú có chứa Facebook ID [FB:xxxxx]
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select(`
          order_id,
          order_number,
          total_amount,
          order_status,
          payment_status,
          created_at,
          order_items (
            product_name,
            quantity,
            variant_name
          )
        `)
        .ilike('customer_note', `%[FB:${senderId}]%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      if (!orders || orders.length === 0) {
        await this.sendMessage(senderId, {
          text: '📦 Bạn chưa có đơn hàng nào.\n\nHãy bắt đầu mua sắm ngay!',
          quick_replies: [
            { content_type: 'text', title: '📱 Xem sản phẩm', payload: 'MENU_PRODUCTS' },
          ],
        });
        return;
      }

      let orderText = '📦 ĐƠN HÀNG CỦA BẠN 📦\n━━━━━━━━━━━━━━━━━━━━━\n\n';

      orders.forEach((order: any, index: number) => {
        const statusEmoji = this.getStatusEmoji(order.order_status);
        const items = order.order_items || [];
        const itemInfo = items.map((item: any) => `${item.product_name} x${item.quantity}`).join(', ');
        
        orderText += `${index + 1}. #${order.order_number || order.order_id}\n`;
        orderText += `   📱 ${itemInfo || 'Sản phẩm'}\n`;
        orderText += `   💵 ${this.formatPrice(order.total_amount)}\n`;
        orderText += `   ${statusEmoji} ${this.getStatusText(order.order_status)}\n\n`;
      });

      await this.sendMessage(senderId, {
        text: orderText,
        quick_replies: [
          { content_type: 'text', title: '📱 Mua thêm', payload: 'MENU_PRODUCTS' },
          { content_type: 'text', title: '💬 Hỗ trợ', payload: 'CONTACT_SUPPORT' },
        ],
      });
    } catch (error) {
      this.logger.error(`Lỗi lấy lịch sử đơn hàng: ${error.message}`);
      await this.sendMessage(senderId, {
        text: '❌ Có lỗi xảy ra. Vui lòng thử lại sau.',
      });
    }
  }

  /**
   * Gửi thông tin hỗ trợ
   */
  private async sendSupportInfo(senderId: string): Promise<void> {
    await this.sendMessage(senderId, {
      text: `💬 THÔNG TIN HỖ TRỢ 💬
━━━━━━━━━━━━━━━━━━━━━

📞 Hotline: 0123 456 789
📧 Email: support@shop.com
⏰ Giờ làm việc: 8:00 - 22:00

📍 Địa chỉ cửa hàng:
123 Đường ABC, Quận XYZ
TP. Hồ Chí Minh

Nhân viên sẽ hỗ trợ bạn sớm nhất! ❤️`,
      quick_replies: [
        { content_type: 'text', title: '📱 Xem sản phẩm', payload: 'MENU_PRODUCTS' },
        { content_type: 'text', title: '🏠 Menu chính', payload: 'MENU' },
      ],
    });
  }

  /**
   * Gửi tin nhắn không hiểu
   */
  private async sendUnknownMessage(senderId: string): Promise<void> {
    await this.sendMessage(senderId, {
      text: '🤔 Xin lỗi, tôi chưa hiểu ý bạn.\n\nVui lòng chọn từ menu bên dưới hoặc gõ "menu" để xem các tùy chọn.',
      quick_replies: [
        { content_type: 'text', title: '📱 Xem sản phẩm', payload: 'MENU_PRODUCTS' },
        { content_type: 'text', title: '📦 Đơn hàng', payload: 'VIEW_ORDERS' },
        { content_type: 'text', title: '💬 Hỗ trợ', payload: 'CONTACT_SUPPORT' },
      ],
    });
  }

  /**
   * Gửi tin nhắn đến Facebook
   */
  private async sendMessage(recipientId: string, message: any): Promise<void> {
    const accessToken = this.configService.get('FACEBOOK_PAGE_ACCESS_TOKEN');

    if (!accessToken) {
      this.logger.error('FACEBOOK_PAGE_ACCESS_TOKEN chưa được cấu hình!');
      return;
    }

    try {
      const response = await axios.post(
        this.FB_API_URL,
        {
          recipient: { id: recipientId },
          message: message,
        },
        {
          params: { access_token: accessToken },
          timeout: 5000, // 5 giây timeout theo yêu cầu webhook
        },
      );

      this.logger.log(`Đã gửi tin nhắn đến ${recipientId}: ${response.status}`);
    } catch (error) {
      // Log chi tiết lỗi từ Facebook API
      const errorData = error.response?.data;
      if (errorData) {
        this.logger.error(`Lỗi gửi tin nhắn - Facebook API: ${JSON.stringify(errorData)}`);
      } else {
        this.logger.error(`Lỗi gửi tin nhắn: ${error.message}`);
      }
      throw error;
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Lấy session của user
   */
  private getUserSession(userId: string): UserSession {
    if (!this.userSessions.has(userId)) {
      this.resetUserSession(userId);
    }
    return this.userSessions.get(userId)!;
  }

  /**
   * Cập nhật session của user
   */
  private updateUserSession(userId: string, updates: Partial<UserSession>): void {
    const session = this.getUserSession(userId);
    this.userSessions.set(userId, {
      ...session,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Reset session của user
   */
  private resetUserSession(userId: string): void {
    this.userSessions.set(userId, {
      state: ConversationState.IDLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Format giá tiền VNĐ
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  /**
   * Lấy emoji theo trạng thái đơn hàng
   */
  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      processing: '🔄',
      shipping: '🚚',
      delivered: '📦',
      cancelled: '❌',
    };
    return emojis[status] || '❓';
  }

  /**
   * Lấy text theo trạng thái đơn hàng
   */
  private getStatusText(status: string): string {
    const texts: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
    };
    return texts[status] || 'Không xác định';
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Lấy danh sách sản phẩm (public API)
   */
  async getProductList(): Promise<Product[]> {
    return this.loadProductsFromDatabase();
  }

  /**
   * Lấy đơn hàng theo ID (public API)
   */
  async getOrderById(orderId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      this.logger.error(`Lỗi lấy đơn hàng: ${error.message}`);
      return null;
    }

    return data;
  }

  /**
   * Lấy tất cả đơn hàng (admin API)
   */
  async getAllOrders(limit = 50, offset = 0): Promise<any> {
    const { data, error, count } = await this.supabase
      .from('messenger_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(`Lỗi lấy danh sách đơn hàng: ${error.message}`);
      return { orders: [], total: 0 };
    }

    return { orders: data, total: count };
  }

  /**
   * Cập nhật trạng thái đơn hàng (admin API)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<any> {
    const { data, error } = await this.supabase
      .from('messenger_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Lỗi cập nhật trạng thái: ${error.message}`);
      throw error;
    }

    return data;
  }
}
