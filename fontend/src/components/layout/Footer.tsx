// File: fontend/src/components/layout/Footer.tsx

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">GoatTech</h3>
            <p className="text-gray-400">Ốp điện thoại cao cấp và phụ kiện công nghệ</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Cửa Hàng</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/shop" className="hover:text-white">Ốp iPhone</Link></li>
              <li><Link href="/shop" className="hover:text-white">Phụ Kiện</Link></li>
              <li><Link href="/promotions" className="hover:text-white">Khuyến Mại</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact" className="hover:text-white">Liên Hệ</Link></li>
              <li>Chính Sách Hoàn Hàng</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Theo Dõi</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2024 GoatTech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}