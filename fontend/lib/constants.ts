// Danh mục sản phẩm - dùng chung cho tất cả các trang
export const PRODUCT_CATEGORIES = [
  { name: 'Ốp lưng', icon: '📱', count: 120 },
  { name: 'Cường lực màn hình', icon: '🛡️', count: 95 },
  { name: 'Miếng dán camera', icon: '📷', count: 85 },
  // { name: 'Cáp sạc', icon: '⚡', count: 60 },
  // { name: 'Tai nghe', icon: '🎧', count: 40 },
  // { name: 'Dây đeo điện thoại', icon: '🔗', count: 60 },
  // { name: 'Sticker trang trí', icon: '✨', count: 40 }
];

// Danh mục cho trang Shop (có thêm "Tất Cả")
export const SHOP_CATEGORIES = [
  { name: 'Tất Cả', icon: '🛒' },
  ...PRODUCT_CATEGORIES.map(cat => ({ name: cat.name, icon: cat.icon }))
];

// Thương hiệu
export const BRAND_NAME = 'GoatTech';

// Danh sách thiết bị hỗ trợ
export const DEVICES = [
  'iPhone 17 Pro Max',
  'iPhone 17 Pro',
  'iPhone 16 Pro Max',
  'iPhone 16 Pro',
  'iPhone 16e',
  'iPhone 15 Pro Max',
  'iPhone 15 Pro',
  'iPhone 14 Pro Max',
  'Samsung Galaxy S24',
];

// Banner slides cho trang chủ
export const BANNER_SLIDES = [
  {
    title: 'Ốp Điện Thoại Cao Cấp - Shop #1 Việt Nam',
    subtitle: 'Bảo Vệ Điện Thoại Của Bạn Với Phong Cách',
    bg: 'from-purple-600 to-pink-600'
  },
  {
    title: 'Bộ Sưu Tập Xuân 2024 - Mẫu Mới Đặc Biệt',
    subtitle: 'Thiết Kế Độc Đáo, Chất Lượng Tuyệt Vời',
    bg: 'from-blue-600 to-cyan-600'
  },
  {
    title: 'Miễn Phí Vận Chuyển - Đơn Hàng Trên 100K',
    subtitle: 'Nhanh, An Toàn, Uy Tín',
    bg: 'from-green-600 to-teal-600'
  }
];
