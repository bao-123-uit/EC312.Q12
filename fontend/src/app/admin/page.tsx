'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderTree, 
  Star, 
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  UserCheck,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  Check,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { fetchProducts, fetchOrders, fetchCustomers, fetchCategories } from '@/lib/api-client';

interface Product {
  product_id: number;
  product_name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id?: number;
  image_url?: string;
  is_active: boolean;
}

interface Order {
  order_id: number;
  customer_id: number;
  order_date: string;
  order_status: string;
  total_amount: number;
  payment_status: string;
}

interface Customer {
  customer_id: number;
  full_name: string;
  email: string;
  phone_number?: string;
  address?: string;
  created_at: string;
}

interface Category {
  category_id: number;
  category_name: string;
  category_slug: string;
  description?: string;
  parent_category_id?: number;
  is_active: boolean;
  display_order: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadData();
    }
  }, [activeTab, isMounted]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'products' || activeTab === 'dashboard') {
        const data = await fetchProducts(100);
        setProducts(Array.isArray(data) ? data : []);
      }
      if (activeTab === 'orders' || activeTab === 'dashboard') {
        const data = await fetchOrders(50);
        setOrders(Array.isArray(data) ? data : []);
      }
      if (activeTab === 'customers' || activeTab === 'dashboard') {
        const data = await fetchCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      }
      if (activeTab === 'categories' || activeTab === 'dashboard') {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: 'Tổng Doanh Thu', 
      value: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString('vi-VN') + '₫', 
      icon: DollarSign, 
      color: 'bg-green-500', 
      change: '+12.5%' 
    },
    { 
      label: 'Đơn Hàng', 
      value: orders.length.toString(), 
      icon: ShoppingCart, 
      color: 'bg-blue-500', 
      change: '+8.2%' 
    },
    { 
      label: 'Sản Phẩm', 
      value: products.length.toString(), 
      icon: Package, 
      color: 'bg-purple-500', 
      change: '+3.1%' 
    },
    { 
      label: 'Khách Hàng', 
      value: customers.length.toString(), 
      icon: Users, 
      color: 'bg-orange-500', 
      change: '+15.3%' 
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { id: 'products', label: 'Sản Phẩm', icon: Package },
    { id: 'orders', label: 'Đơn Hàng', icon: ShoppingCart },
    { id: 'customers', label: 'Khách Hàng', icon: Users },
    { id: 'categories', label: 'Danh Mục', icon: FolderTree },
    { id: 'reviews', label: 'Đánh Giá', icon: Star },
    { id: 'settings', label: 'Cài Đặt', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'đang xử lý': return 'bg-yellow-100 text-yellow-800';
      case 'processing':
      case 'đang giao': return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'delivered':
      case 'đã giao': return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'đã hủy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (type: 'add' | 'edit', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      console.log('Delete item:', id);
      loadData();
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    filterStatus === 'all' || o.order_status === filterStatus
  );

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(c => 
    c.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {isSidebarOpen && <h1 className="text-xl font-bold">BURGA Admin</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition ${
                activeTab === item.id ? 'bg-gray-800 border-l-4 border-pink-500' : ''
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-red-400">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-bold">
              {menuItems.find(item => item.id === activeTab)?.label || 'Tổng Quan'}
            </h2>
            <p className="text-sm text-gray-600">Chào mừng trở lại, Admin!</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-pink-600 hover:underline">Xem Website</Link>
            <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
                    </div>
                    <h3 className="text-gray-600 text-sm mb-1">{stat.label}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Doanh Thu 7 Ngày Qua</h3>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {[65, 80, 70, 90, 85, 95, 100].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-pink-600 rounded-t" style={{ height: `${height}%` }}></div>
                        <span className="text-xs text-gray-600 mt-2">T{i + 2}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Sản Phẩm Bán Chạy</h3>
                  <div className="space-y-4">
                    {['Ốp iPhone 15 Pro Max', 'Kính cường lực Samsung', 'Ốp Xiaomi 13 Pro', 'Dây đeo điện thoại', 'Ốp Minimal Design'].map((product, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded"></div>
                          <div>
                            <p className="font-medium">{product}</p>
                            <p className="text-sm text-gray-600">{Math.floor(Math.random() * 100) + 50} đã bán</p>
                          </div>
                        </div>
                        <span className="font-bold text-pink-600">{(Math.random() * 500 + 200).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-bold">Đơn Hàng Gần Đây</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐH</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Đặt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số Tiền</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thanh Toán</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.order_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.order_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold">{order.total_amount?.toLocaleString('vi-VN')}₫</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                              {order.order_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                              {order.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Quản Lý Sản Phẩm ({products.length})</h3>
                  <button 
                    onClick={() => openModal('add')}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Thêm Sản Phẩm
                  </button>
                </div>

                {/* Search */}
                <div className="mb-4 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Sản Phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn Kho</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">#{product.product_id}</td>
                          <td className="px-6 py-4">{product.product_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold">{product.price?.toLocaleString('vi-VN')}₫</td>
                          <td className="px-6 py-4 whitespace-nowrap">{product.stock_quantity || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {product.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openModal('edit', product)} className="text-blue-600 hover:text-blue-800">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(product.product_id)} className="text-red-600 hover:text-red-800">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Quản Lý Đơn Hàng ({orders.length})</h3>
                <div className="flex gap-2">
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐH</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách Hàng ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Đặt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng Tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thanh Toán</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.order_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.order_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">#{order.customer_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold">{order.total_amount?.toLocaleString('vi-VN')}₫</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <Eye className="w-4 h-4" /> Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Quản Lý Khách Hàng ({customers.length})</h3>
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ Tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Đăng Ký</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.customer_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">#{customer.customer_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{customer.full_name}</td>
                        <td className="px-6 py-4">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{customer.phone_number || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(customer.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <Eye className="w-4 h-4" /> Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Quản Lý Danh Mục ({categories.length})</h3>
                <button 
                  onClick={() => openModal('add')}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Thêm Danh Mục
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Danh Mục</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thứ Tự</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCategories.map((category) => (
                      <tr key={category.category_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">#{category.category_id}</td>
                        <td className="px-6 py-4 font-medium">{category.category_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{category.category_slug}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{category.display_order}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {category.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openModal('edit', category)} className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(category.category_id)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-6">Quản Lý Đánh Giá</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                        </div>
                        <span className="font-semibold">Nguyễn Văn A</span>
                        <span className="text-sm text-gray-500">2 ngày trước</span>
                      </div>
                      <p className="text-gray-700 mb-2">Sản phẩm rất đẹp, chất lượng tốt. Shop giao hàng nhanh!</p>
                      <div className="text-sm text-gray-500">Ốp iPhone 15 Pro Max</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-green-600 hover:text-green-800">
                        <Check className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-500 py-8">Kết nối API để hiển thị đánh giá từ database...</p>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-6">Cài Đặt Hệ Thống</h3>
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <h4 className="font-semibold mb-4">Thông Tin Website</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Tên Website</label>
                      <input type="text" defaultValue="BURGA Vietnam" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Email Liên Hệ</label>
                      <input type="email" defaultValue="contact@burga.vn" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Số Điện Thoại</label>
                      <input type="tel" defaultValue="0123456789" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Địa Chỉ</label>
                      <input type="text" defaultValue="Hà Nội, Việt Nam" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h4 className="font-semibold mb-4">Cài Đặt Thanh Toán</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Chấp nhận thanh toán COD</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4" />
                      <span>Chấp nhận thanh toán MoMo</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Chấp nhận thanh toán VNPay</span>
                    </label>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <h4 className="font-semibold mb-4">Cài Đặt Vận Chuyển</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Phí Ship Mặc Định</label>
                      <input type="number" defaultValue="30000" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Miễn Ship Từ (VNĐ)</label>
                      <input type="number" defaultValue="200000" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                  </div>
                </div>

                <button className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 font-medium">
                  Lưu Tất Cả Thay Đổi
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {modalType === 'add' ? 'Thêm Mới' : 'Chỉnh Sửa'} {activeTab === 'products' ? 'Sản Phẩm' : 'Danh Mục'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                {activeTab === 'products' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tên Sản Phẩm</label>
                      <input 
                        type="text" 
                        defaultValue={selectedItem?.product_name}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Nhập tên sản phẩm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mô Tả</label>
                      <textarea 
                        defaultValue={selectedItem?.description}
                        className="w-full border rounded-lg px-3 py-2 h-24"
                        placeholder="Nhập mô tả sản phẩm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Giá (VNĐ)</label>
                        <input 
                          type="number" 
                          defaultValue={selectedItem?.price}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tồn Kho</label>
                        <input 
                          type="number" 
                          defaultValue={selectedItem?.stock_quantity}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">URL Hình Ảnh</label>
                      <input 
                        type="text" 
                        defaultValue={selectedItem?.image_url}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={selectedItem?.is_active !== false}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Kích hoạt sản phẩm</span>
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'categories' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tên Danh Mục</label>
                      <input 
                        type="text" 
                        defaultValue={selectedItem?.category_name}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Nhập tên danh mục"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Slug</label>
                      <input 
                        type="text" 
                        defaultValue={selectedItem?.category_slug}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="ten-danh-muc"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mô Tả</label>
                      <textarea 
                        defaultValue={selectedItem?.description}
                        className="w-full border rounded-lg px-3 py-2 h-20"
                        placeholder="Nhập mô tả danh mục"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Thứ Tự Hiển Thị</label>
                      <input 
                        type="number" 
                        defaultValue={selectedItem?.display_order}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={selectedItem?.is_active !== false}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">Kích hoạt danh mục</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      closeModal();
                      loadData();
                    }}
                    className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-medium"
                  >
                    {modalType === 'add' ? 'Thêm Mới' : 'Cập Nhật'}
                  </button>
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
