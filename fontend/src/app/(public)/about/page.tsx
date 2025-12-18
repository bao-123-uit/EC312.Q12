'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Heart, Search, Menu, Award, Users, Globe, Truck, Shield, Star } from 'lucide-react';
import Link from 'next/link';
import { fetchCategories } from '@/lib/api-client';

const AboutPage: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 17 Pro Max');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [devices, setDevices] = useState<string[]>(['iPhone 17 Pro Max']);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (Array.isArray(data) && data.length > 0) {
          const categoryNames = data.map((cat: any) => cat.category_name);
          setDevices(categoryNames);
          setSelectedDevice(categoryNames[0]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setIsCurrencyModalOpen(false);
  };

  const stats = [
    { number: '100K+', label: 'Khách Hàng Hài Lòng', icon: Users },
    { number: '100K+', label: 'Sản Phẩm Đã Bán', icon: Award },
    { number: '50+', label: 'Quốc Gia', icon: Globe },
    { number: '4.5/5', label: 'Đánh Giá Trung Bình', icon: Star }
  ];

  const values = [
    {
      icon: Award,
      title: 'Chất Lượng Cao Cấp',
      description: 'Sử dụng vật liệu cao cấp nhất, đảm bảo độ bền và bảo vệ tối ưu cho thiết bị của bạn.'
    },
    {
      icon: Shield,
      title: 'Bảo Vệ Tuyệt Đối',
      description: 'Thiết kế chống sốc, chống trầy xước, bảo vệ điện thoại trong mọi tình huống.'
    },
    {
      icon: Truck,
      title: 'Giao Hàng Nhanh',
      description: 'Giao hàng toàn quốc trong 2-5 ngày, miễn phí cho đơn hàng trên 100K.'
    },
    {
      icon: Star,
      title: 'Thiết Kế Độc Đáo',
      description: 'Hàng trăm mẫu thiết kế độc quyền, từ tối giản đến nghệ thuật đầy màu sắc.'
    }
  ];

  const team = [
    {
      name: 'Phạm Công Đoàn',
      role: 'Giám Đốc Điều Hành',
      image: 'đoàn.jpg'
    },
    {
      name: 'Võ Trần Minh Bảo',
      role: 'Trưởng Phòng Thiết Kế',
      image: 'bảo.jpg'
    },
    {
      name: 'Triệu Quân Sự',
      role: 'Trưởng Phòng Marketing',
      image: 'lĩnh.jpg'
    },
    {
      name: 'Đoàn Văn Sáng',
      role: 'Trưởng Phòng Kinh Doanh',
      image: 'nam.png'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Currency Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setIsCurrencyModalOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">CHỌN LOẠI TIỀN TỆ</h2>
              <button onClick={() => setIsCurrencyModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">QUỐC GIA/KHU VỰC:</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="USD">United States (USD $)</option>
                <option value="VND">Việt Nam (VND ₫)</option>
              </select>
            </div>

            <button 
              onClick={() => setIsCurrencyModalOpen(false)}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              ÁP DỤNG
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Về GoatTech</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Chúng tôi là thương hiệu ốp điện thoại số 1 Việt Nam, mang đến sự bảo vệ hoàn hảo với phong cách độc đáo
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Câu Chuyện Của Chúng Tôi</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                GoatTech được thành lập vào năm 2018 với sứ mệnh mang đến những sản phẩm bảo vệ điện thoại chất lượng cao và thiết kế độc đáo cho người dùng Việt Nam.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Bắt đầu từ một cửa hàng nhỏ ở TP.HCM, chúng tôi đã phát triển thành thương hiệu ốp điện thoại được yêu thích nhất với hơn 500,000 khách hàng trên toàn quốc.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Mỗi sản phẩm của GoatTech đều được thiết kế tỉ mỉ, từ việc chọn vật liệu cao cấp đến quy trình sản xuất nghiêm ngặt, đảm bảo mang đến trải nghiệm tốt nhất cho khách hàng.
              </p>
              <Link href="/shop" className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition">
                Khám Phá Sản Phẩm
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="about1.jpg"
                alt="GoatTech Store"
                className="rounded-xl shadow-lg w-full h-48 object-cover"
              />
              <img
                src="about2.jpg"
                alt="Phone Cases"
                className="rounded-xl shadow-lg w-full h-48 object-cover mt-8"
              />
              <img
                src="about3.jpg"
                alt="Design Process"
                className="rounded-xl shadow-lg w-full h-48 object-cover"
              />
              <img
                src="about4.jpg"
                alt="Quality Check"
                className="rounded-xl shadow-lg w-full h-48 object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Giá Trị Cốt Lõi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <value.icon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Đội Ngũ Của Chúng Tôi</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Đội ngũ chuyên nghiệp, tận tâm và sáng tạo luôn nỗ lực để mang đến những sản phẩm tốt nhất
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">Sứ Mệnh Của Chúng Tôi</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Mang đến cho mỗi khách hàng những sản phẩm bảo vệ điện thoại chất lượng cao nhất, 
            kết hợp giữa tính năng vượt trội và thiết kế nghệ thuật, 
            giúp họ thể hiện phong cách riêng và bảo vệ thiết bị yêu quý của mình.
          </p>
          <Link href="/contact" className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Liên Hệ Với Chúng Tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
