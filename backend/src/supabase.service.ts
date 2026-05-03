import { Injectable } from '@nestjs/common';
import {
  usersRepository,
  productsRepository,
  ordersRepository,
  categoriesRepository,
  reviewsRepository,
  contactsRepository,
  collectionsRepository,
  paymentRepository,
  inventoryRepository,
  shoppingCartRepository,
  wishlistRepository,
  giftsRepository,
  designsRepository,
  couponsRepository,
  promotionsRepository,
  BaseRepository,
} from './repositories';

/**
 * SupabaseService - Backward compatible service
 * Delegate tất cả methods sang các repository riêng biệt
 * 
 * @deprecated Nên sử dụng trực tiếp các repository thay vì SupabaseService
 * Import từ './repositories' để sử dụng các repository riêng
 */
@Injectable()
export class SupabaseService extends BaseRepository {

  // ============ USERS ============
  getCustomers = () => usersRepository.getCustomers();
  getCustomerById = (customerId: string) => usersRepository.getCustomerById(customerId);
  createCustomer = (customerData: any) => usersRepository.createCustomer(customerData);
  getCustomerByEmail = (email: string) => usersRepository.getCustomerByEmail(email);
  loginCustomer = (email: string, password: string) => usersRepository.loginCustomer(email, password);
  createCustomerAddress = (addressData: any) => usersRepository.createCustomerAddress(addressData);
  getCustomerAddresses = (customerId: number) => usersRepository.getCustomerAddresses(customerId);

  // ============ PRODUCTS ============
  getProducts = (limit = 10) => productsRepository.getProducts(limit);
  getProductById = (productId: number) => productsRepository.getProductById(productId);
  createProduct = (productData: any) => productsRepository.createProduct(productData);
  updateProduct = (productId: number, productData: any) => productsRepository.updateProduct(productId, productData);
  deleteProduct = (productId: number) => productsRepository.deleteProduct(productId);
  getProductsByCategory = (categoryId: number) => productsRepository.getProductsByCategory(categoryId);
  getProductsBySeason = (season: string) => productsRepository.getProductsBySeason(season);
  getSeasonProductCounts = () => productsRepository.getSeasonProductCounts();

  // ============ ORDERS ============
  getOrders = (limit = 20) => ordersRepository.getOrders(limit);
  getOrderById = (orderId: number) => ordersRepository.getOrderById(orderId);
  getOrdersByCustomer = (customerId: number) => ordersRepository.getOrdersByCustomer(customerId);
  createOrder = (orderData: any) => ordersRepository.createOrder(orderData);
  updateOrderStatus = (orderId: number, newStatus: string) => ordersRepository.updateOrderStatus(orderId, newStatus);
  updatePaymentStatus = (orderId: number, paymentStatus: string) => ordersRepository.updatePaymentStatus(orderId, paymentStatus);
  updatePaymentStatusByOrderNumber = (orderNumber: string, paymentStatus: string) => ordersRepository.updatePaymentStatusByOrderNumber(orderNumber, paymentStatus);
  updateOrderStatusByOrderNumber = (orderNumber: string, orderStatus: string) => ordersRepository.updateOrderStatusByOrderNumber(orderNumber, orderStatus);
  getOrderItems = (orderId: number) => ordersRepository.getOrderItems(orderId);
  createOrderItem = (itemData: any) => ordersRepository.createOrderItem(itemData);
  createFullOrder = (orderData: Parameters<typeof ordersRepository.createFullOrder>[0]) => ordersRepository.createFullOrder(orderData);
  createFullOrderItem = (itemData: Parameters<typeof ordersRepository.createFullOrderItem>[0]) => ordersRepository.createFullOrderItem(itemData);
  getOrderByNumber = (orderNumber: string) => ordersRepository.getOrderByNumber(orderNumber);
  getOrderWithItems = (orderId: number) => ordersRepository.getOrderWithItems(orderId);
  getOrderWithItemsByNumber = (orderNumber: string) => ordersRepository.getOrderWithItemsByNumber(orderNumber);

  // ============ CATEGORIES ============
  getAllCategories = () => categoriesRepository.getAllCategories();
  syncCategoryListFromDatabase = () => categoriesRepository.syncCategoryListFromDatabase();
  getCategories = () => categoriesRepository.getCategories();
  getCategoriesWithProductCount = () => categoriesRepository.getCategoriesWithProductCount();
  getCategoryById = (categoryId: number) => categoriesRepository.getCategoryById(categoryId);
  getCategoryBySlug = (slug: string) => categoriesRepository.getCategoryBySlug(slug);
  getRootCategories = () => categoriesRepository.getRootCategories();
  getChildCategories = (parentId: number) => categoriesRepository.getChildCategories(parentId);
  createCategory = (categoryData: any) => categoriesRepository.createCategory(categoryData);
  updateCategory = (categoryId: number, categoryData: any) => categoriesRepository.updateCategory(categoryId, categoryData);
  deleteCategory = (categoryId: number) => categoriesRepository.deleteCategory(categoryId);

  // ============ REVIEWS ============
  getAllReviews = (limit = 50) => reviewsRepository.getAllReviews(limit);
  getProductReviews = (productId: number) => reviewsRepository.getProductReviews(productId);
  getReviewById = (reviewId: number) => reviewsRepository.getReviewById(reviewId);
  createReview = (reviewData: any) => reviewsRepository.createReview(reviewData);
  updateReview = (reviewId: number, reviewData: any) => reviewsRepository.updateReview(reviewId, reviewData);
  deleteReview = (reviewId: number) => reviewsRepository.deleteReview(reviewId);
  approveReview = (reviewId: number, isApproved: boolean) => reviewsRepository.approveReview(reviewId, isApproved);

  // ============ CONTACTS ============
  getAllContactMessages = (limit = 50) => contactsRepository.getAllContactMessages(limit);
  getContactMessageById = (id: number) => contactsRepository.getContactMessageById(id);
  createContactMessage = (messageData: any) => contactsRepository.createContactMessage(messageData);
  updateContactMessageStatus = (id: number, status: string) => contactsRepository.updateContactMessageStatus(id, status);
  deleteContactMessage = (id: number) => contactsRepository.deleteContactMessage(id);

  // ============ COLLECTIONS ============
  getAllDesignCollections = () => collectionsRepository.getAllDesignCollections();
  getDesignCollectionsByType = (type: string) => collectionsRepository.getDesignCollectionsByType(type);
  getDesignCollectionBySlug = (slug: string) => collectionsRepository.getDesignCollectionBySlug(slug);
  getProductsByDesignCollection = (collectionId: number) => collectionsRepository.getProductsByDesignCollection(collectionId);
  getDesignCollectionProductCounts = () => collectionsRepository.getDesignCollectionProductCounts();

  // ============ PAYMENT ============
  createPaymentTransaction = (transactionData: any) => paymentRepository.createPaymentTransaction(transactionData);
  getPaymentTransactionsByOrder = (orderId: number) => paymentRepository.getPaymentTransactionsByOrder(orderId);

  // ============ INVENTORY ============
  getInventory = (productId: number) => inventoryRepository.getInventory(productId);
  updateInventory = (inventoryId: number, updates: any) => inventoryRepository.updateInventory(inventoryId, updates);

  // ============ SHOPPING CART ============
  getShoppingCartByUserId = (userId: string) => shoppingCartRepository.getShoppingCartByUserId(userId);
  getCartItemByUserAndProduct = (userId: string, productId: number, phoneModelId?: number) => 
    shoppingCartRepository.getCartItemByUserAndProduct(userId, productId, phoneModelId);
  createShoppingCartItem = (cartData: Parameters<typeof shoppingCartRepository.createShoppingCartItem>[0]) => 
    shoppingCartRepository.createShoppingCartItem(cartData);
  updateShoppingCartQuantity = (cartId: number, quantity: number) => 
    shoppingCartRepository.updateShoppingCartQuantity(cartId, quantity);
  deleteShoppingCartItem = (cartId: number) => shoppingCartRepository.deleteShoppingCartItem(cartId);
  clearShoppingCart = (userId: string) => shoppingCartRepository.clearShoppingCart(userId);
  getCartItemById = (cartId: number) => shoppingCartRepository.getCartItemById(cartId);

  // ============ WISHLIST ============
  getWishlist = (customerId: number) => wishlistRepository.getWishlist(customerId);
  addToWishlist = (customerId: number, productId: number, variantId?: number) => 
    wishlistRepository.addToWishlist(customerId, productId, variantId);
  removeFromWishlist = (customerId: number, productId: number) => 
    wishlistRepository.removeFromWishlist(customerId, productId);
  getWishlistByUserId = (userId: string) => wishlistRepository.getWishlistByUserId(userId);
  getWishlistProductIds = (userId: string) => wishlistRepository.getWishlistProductIds(userId);
  addProductToWishlist = (userId: string, productId: number) => 
    wishlistRepository.addProductToWishlist(userId, productId);
  removeProductFromWishlist = (userId: string, productId: number) => 
    wishlistRepository.removeProductFromWishlist(userId, productId);
  getWishlistItem = (userId: string, productId: number) => 
    wishlistRepository.getWishlistItem(userId, productId);

  // ============ GIFTS ============
  createGift = (giftData: Parameters<typeof giftsRepository.createGift>[0]) => 
    giftsRepository.createGift(giftData);
  getGiftById = (giftId: string) => giftsRepository.getGiftById(giftId);
  getGiftPublicInfo = (giftId: string) => giftsRepository.getGiftPublicInfo(giftId);
  updateGiftStatus = (giftId: string, status: string, extraData?: any) => 
    giftsRepository.updateGiftStatus(giftId, status, extraData);
  createGiftEmail = (emailData: Parameters<typeof giftsRepository.createGiftEmail>[0]) => 
    giftsRepository.createGiftEmail(emailData);
  getSentGifts = (userId: string) => giftsRepository.getSentGifts(userId);
  getReceivedGifts = (email: string) => giftsRepository.getReceivedGifts(email);

  // ============ DESIGNS & PHONE TEMPLATES ============
  getPhoneTemplates = () => designsRepository.getPhoneTemplates();
  getPhoneTemplateById = (templateId: number) => designsRepository.getPhoneTemplateById(templateId);
  createPhoneTemplate = (templateData: any) => designsRepository.createPhoneTemplate(templateData);
  updatePhoneTemplate = (templateId: number, templateData: any) => 
    designsRepository.updatePhoneTemplate(templateId, templateData);
  deletePhoneTemplate = (templateId: number) => designsRepository.deletePhoneTemplate(templateId);
  createDesign = (designData: any) => designsRepository.createDesign(designData);
  getDesignById = (designId: number) => designsRepository.getDesignById(designId);
  updateDesign = (designId: number, updateData: any) => designsRepository.updateDesign(designId, updateData);
  getUserDesigns = (userId: string) => designsRepository.getUserDesigns(userId);
  getAllDesigns = (status?: string) => designsRepository.getAllDesigns(status);
  deleteDesign = (designId: number) => designsRepository.deleteDesign(designId);
  createDesignImage = (imageData: any) => designsRepository.createDesignImage(imageData);
  getDesignImages = (designId: number) => designsRepository.getDesignImages(designId);

  // ============ COUPONS ============
  getCoupon = (couponCode: string) => couponsRepository.getCoupon(couponCode);

  // ============ PROMOTIONS ============
  getActiveCoupons = () => promotionsRepository.getActiveCoupons();
  getActiveBundleDeals = () => promotionsRepository.getActiveBundleDeals();
}
