'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  XCircle,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { fetchProducts, fetchOrders, fetchAllOrdersAdmin, fetchUsers, fetchCategories, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory, fetchAllReviews, approveReview, deleteReview, fetchAllContacts, updateContactStatus, deleteContact, fetchAllCollections, updateProductCollections, fetchProductCollections, fetchAdminDashboard } from '@/lib/api-client';

interface Collection {
  collection_id: number;
  collection_name: string;
  collection_slug: string;
  collection_type: string;
  is_active: boolean;
}

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  sku: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  category_id?: number;
  brand_id?: number;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  status: string;
}

interface Order {
  order_id: number;
  order_number: string;
  customer_id: string | null;
  order_status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  shipping_full_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  customer_note?: string;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
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

interface Review {
  review_id: number;
  product_id: number;
  user_id: string;
  rating: number;
  review_title?: string;
  review_text?: string;
  is_approved: boolean;
  created_at: string;
  user_name?: string;
  product_name?: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selected collections for product form
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states for product
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    description: '',
    short_description: '',
    price: 0,
    sale_price: 0,
    category_id: null as number | null,
    image_url: '',
    is_featured: false,
    is_new: true,
    status: 'active',
    season: '' as string // Mùa lễ: noel, valentine, tet hoặc rỗng
  });

  // Form states for category
  const [categoryFormData, setCategoryFormData] = useState({
    category_name: '',
    category_slug: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  // Category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Kiểm tra quyền admin
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const customer = localStorage.getItem('customer');
    
    if (!customer || userRole !== 'admin') {
      router.push('/login');
      return;
    }
    
    setIsAuthenticated(true);
    setIsMounted(true);
  }, [router]);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      loadData();
    }
  }, [activeTab, isMounted, isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'products' || activeTab === 'dashboard') {
        const data = await fetchProducts(100);
        setProducts(Array.isArray(data) ? data : []);
        // Load collections for product form
        try {
          const collectionsData = await fetchAllCollections();
          setCollections(Array.isArray(collectionsData) ? collectionsData : []);
        } catch (e) {
          console.log('Collections not available yet');
        }
      }
      if (activeTab === 'orders' || activeTab === 'dashboard') {
        const data = await fetchAllOrdersAdmin();
        setOrders(Array.isArray(data) ? data : []);
      }
      if (activeTab === 'customers' || activeTab === 'dashboard') {
        const data = await fetchUsers();
        setCustomers(Array.isArray(data) ? data : []);
      }
      if (activeTab === 'categories' || activeTab === 'dashboard') {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      }
      if (activeTab === 'reviews' || activeTab === 'dashboard') {
        const data = await fetchAllReviews();
        setReviews(Array.isArray(data) ? data : []);
      }
      if (activeTab === 'contacts' || activeTab === 'dashboard') {
        const data = await fetchAllContacts();
        setContacts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    if (isMounted && isAuthenticated && activeTab === 'dashboard') {
      fetchAdminDashboard().then(setDashboard).catch(console.error);
    }
  }, [isMounted, isAuthenticated, activeTab]);

  const revenue7Days = dashboard?.revenue7Days || [];
  const bestSellers = dashboard?.bestSellers || [];

  const stats = dashboard ? [
    {
      label: 'Tổng Doanh Thu',
      value: (dashboard.totalRevenue || 0).toLocaleString('vi-VN') + '₫',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Đơn Hàng',
      value: (dashboard.orderCount || 0).toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      label: 'Sản Phẩm',
      value: (dashboard.productCount || 0).toString(),
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      label: 'Khách Hàng',
      value: (dashboard.customerCount || 0).toString(),
      icon: Users,
      color: 'bg-orange-500'
    }
  ] : [
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
    { id: 'contacts', label: 'Tin Nhắn', icon: MessageSquare },
    { id: 'designs', label: ' Thiết Kế', icon: Package, isLink: true, href: '/admin/designs' },
    { id: 'templates', label: 'Các mẫu điện thoại', icon: Package, isLink: true, href: '/admin/templates' },
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

  const openModal = async (type: 'add' | 'edit', item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    if (type === 'edit' && item) {
      setFormData({
        product_name: item.product_name || '',
        sku: item.sku || '',
        description: item.description || '',
        short_description: item.short_description || '',
        price: item.price || 0,
        sale_price: item.sale_price || 0,
        category_id: item.category_id || null,
        image_url: item.image_url || '',
        is_featured: item.is_featured || false,
        is_new: item.is_new || false,
        status: item.status || 'active',
        season: item.season || ''
      });
      // Load collections của sản phẩm
      try {
        const productColls = await fetchProductCollections(item.product_id);
        const collIds = productColls.map((pc: any) => pc.collection_id);
        setSelectedCollections(collIds);
      } catch (e) {
        setSelectedCollections([]);
      }
    } else {
      setFormData({
        product_name: '',
        sku: '',
        description: '',
        short_description: '',
        price: 0,
        sale_price: 0,
        category_id: null,
        image_url: '',
        is_featured: false,
        is_new: true,
        status: 'active',
        season: ''
      });
      setSelectedCollections([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setSelectedCollections([]);
  };

  const handleCollectionToggle = (collectionId: number) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleSaveProduct = async () => {
    // Validate bắt buộc chọn danh mục
    if (!formData.category_id) {
      alert('Vui lòng chọn danh mục sản phẩm!');
      return;
    }
    
    try {
      setLoading(true);
      
      // Tự động tạo slug từ tên sản phẩm
      const slug = formData.product_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const dataToSend = {
        ...formData,
        product_slug: slug
      };
      
      // Debug log
      console.log('=== FRONTEND DEBUG ===');
      console.log('formData:', formData);
      console.log('dataToSend:', dataToSend);
      console.log('image_url:', dataToSend.image_url);
      
      let productId: number;
      
      if (modalType === 'add') {
        const result = await createProduct(dataToSend);
        if (result.success) {
          productId = result.data?.product_id;
          // Lưu collections cho sản phẩm mới
          if (productId && selectedCollections.length > 0) {
            try {
              await updateProductCollections(productId, selectedCollections);
            } catch (e) {
              console.log('Could not save collections');
            }
          }
          alert('Thêm sản phẩm thành công!');
        } else {
          alert('Lỗi: ' + result.message);
        }
      } else {
        const result = await updateProduct(selectedItem.product_id, dataToSend);
        if (result.success) {
          // Cập nhật collections cho sản phẩm
          try {
            await updateProductCollections(selectedItem.product_id, selectedCollections);
          } catch (e) {
            console.log('Could not update collections');
          }
          alert('Cập nhật sản phẩm thành công!');
        } else {
          alert('Lỗi: ' + result.message);
        }
      }
      closeModal();
      loadData();
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          alert('Xóa sản phẩm thành công!');
          loadData();
        } else {
          alert('Lỗi: ' + result.message);
        }
      } catch (error: any) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      console.log('Delete item:', id);
      loadData();
    }
  };

  // Category modal functions
  const openCategoryModal = (type: 'add' | 'edit', category?: any) => {
    setCategoryModalType(type);
    setSelectedCategory(category || null);
    if (type === 'edit' && category) {
      setCategoryFormData({
        category_name: category.category_name || '',
        category_slug: category.category_slug || '',
        description: category.description || '',
        display_order: category.display_order || 0,
        is_active: category.is_active ?? true
      });
    } else {
      setCategoryFormData({
        category_name: '',
        category_slug: '',
        description: '',
        display_order: 0,
        is_active: true
      });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
  };

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      
      // Tự động tạo slug từ tên danh mục
      const slug = categoryFormData.category_slug || categoryFormData.category_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const dataToSend = {
        ...categoryFormData,
        category_slug: slug
      };
      
      if (categoryModalType === 'add') {
        const result = await createCategory(dataToSend);
        if (result.data) {
          alert('Thêm danh mục thành công!');
        } else {
          alert('Lỗi: ' + (result.error?.message || 'Không thể thêm danh mục'));
        }
      } else {
        const result = await updateCategory(selectedCategory.category_id, dataToSend);
        if (result.data) {
          alert('Cập nhật danh mục thành công!');
        } else {
          alert('Lỗi: ' + (result.error?.message || 'Không thể cập nhật danh mục'));
        }
      }
      closeCategoryModal();
      loadData();
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        const result = await deleteCategory(id);
        if (!result.error) {
          alert('Xóa danh mục thành công!');
          loadData();
        } else {
          alert('Lỗi: ' + result.error.message);
        }
      } catch (error: any) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  // Review handlers
  const handleApproveReview = async (id: number, approve: boolean) => {
    try {
      const result = await approveReview(id, approve);
      if (!result.error) {
        alert(approve ? 'Đã duyệt đánh giá!' : 'Đã từ chối đánh giá!');
        loadData();
      } else {
        alert('Lỗi: ' + result.error.message);
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        const result = await deleteReview(id);
        if (!result.error) {
          alert('Xóa đánh giá thành công!');
          loadData();
        } else {
          alert('Lỗi: ' + result.error.message);
        }
      } catch (error: any) {
        alert('Lỗi: ' + error.message);
      }
    }
  };

  // Contact handlers
  const handleUpdateContactStatus = async (id: number, status: string) => {
    try {
      const result = await updateContactStatus(id, status);
      if (result.success) {
        alert(status === 'replied' ? 'Đã đánh dấu đã trả lời!' : 'Cập nhật trạng thái thành công!');
        loadData();
      } else {
        alert('Lỗi: ' + result.error?.message);
      }
    } catch (error: any) {
      alert('Lỗi: ' + error.message);
    }
  };

  const handleDeleteContact = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      try {
        const result = await deleteContact(id);
        if (result.success) {
          alert('Xóa tin nhắn thành công!');
          loadData();
        } else {
          alert('Lỗi: ' + result.error?.message);
        }
      } catch (error: any) {
        alert('Lỗi: ' + error.message);
      }
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

  const handleLogout = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  if (!isMounted || !isAuthenticated) {
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
          {isSidebarOpen && <h1 className="text-xl font-bold">GoatTech Admin</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item: any) => (
            item.isLink ? (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition`}
              >
                <item.icon className="w-5 h-5" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            ) : (
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
            )
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition text-red-400"
          >
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
                    {revenue7Days.length === 7 ? revenue7Days.map((amount, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-pink-600 rounded-t" style={{ height: `${Math.max(amount / Math.max(...revenue7Days, 1) * 100, 5)}%` }}></div>
                        <span className="text-xs text-gray-600 mt-2">T{i + 2}</span>
                        <span className="text-xs text-gray-500">{amount.toLocaleString('vi-VN')}₫</span>
                      </div>
                    )) : <div className="text-gray-400">Không có dữ liệu</div>}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-4">Sản Phẩm Bán Chạy</h3>
                  <div className="space-y-4">
                    {bestSellers.length > 0 ? bestSellers.map((product, i) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded"></div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.sold} đã bán</p>
                          </div>
                        </div>
                        <span className="font-bold text-pink-600">{Math.round(product.revenue/1000)}K</span>
                      </div>
                    )) : <div className="text-gray-400">Không có dữ liệu</div>}
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
                          <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.order_number || order.order_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '-'}</td>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Sản Phẩm</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá KM</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">#{product.product_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.sku}</td>
                          <td className="px-6 py-4">{product.product_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold">{product.price?.toLocaleString('vi-VN')}₫</td>
                          <td className="px-6 py-4 whitespace-nowrap text-pink-600">
                            {product.sale_price ? `${product.sale_price.toLocaleString('vi-VN')}₫` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.status === 'active' ? 'bg-green-100 text-green-800' : 
                              product.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {product.status === 'active' ? 'Đang bán' : 
                               product.status === 'inactive' ? 'Ngừng bán' : 'Bản nháp'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openModal('edit', product)} className="text-blue-600 hover:text-blue-800">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteProduct(product.product_id)} className="text-red-600 hover:text-red-800">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách Hàng</th>
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
                        <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.order_number || order.order_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.customer_id ? (
                            <span>#{order.customer_id.slice(0, 8)}</span>
                          ) : order.shipping_full_name ? (
                            <div className="flex flex-col">
                              <span className="font-medium">{order.shipping_full_name}</span>
                              <span className="text-xs text-gray-500">{order.shipping_phone}</span>
                              {order.order_number?.startsWith('MSG') && (
                                <span className="text-xs text-blue-500"> Messenger</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Khách vãng lai</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '-'}</td>
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
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">#{customer.id?.slice(0, 8)}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{customer.full_name}</td>
                        <td className="px-6 py-4">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{customer.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN') : '-'}</td>
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
                  onClick={() => openCategoryModal('add')}
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
                            <button onClick={() => openCategoryModal('edit', category)} className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteCategory(category.category_id)} className="text-red-600 hover:text-red-800">
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
              <h3 className="text-lg font-bold mb-6">Quản Lý Đánh Giá ({reviews.length})</h3>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Đang tải...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có đánh giá nào.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.review_id} className={`border rounded-lg p-4 ${review.is_approved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1,2,3,4,5].map(i => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="font-semibold">{review.user_name || 'Khách hàng'}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {review.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                          </div>
                          {review.review_title && (
                            <h4 className="font-medium text-gray-800 mb-1">{review.review_title}</h4>
                          )}
                          <p className="text-gray-700 mb-2">{review.review_text || 'Không có nội dung'}</p>
                          <div className="text-sm text-gray-500">Sản phẩm: {review.product_name || `ID: ${review.product_id}`}</div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {!review.is_approved && (
                            <button 
                              onClick={() => handleApproveReview(review.review_id, true)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Duyệt"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          {review.is_approved && (
                            <button 
                              onClick={() => handleApproveReview(review.review_id, false)}
                              className="text-orange-600 hover:text-orange-800 p-1"
                              title="Bỏ duyệt"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteReview(review.review_id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CONTACTS TAB */}
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-6">Quản Lý Tin Nhắn Liên Hệ ({contacts.length})</h3>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Đang tải...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có tin nhắn nào.</p>
                ) : (
                  contacts.map((contact) => (
                    <div key={contact.id} className={`border rounded-lg p-4 ${contact.status === 'replied' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-lg">{contact.name}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(contact.created_at).toLocaleDateString('vi-VN')} {new Date(contact.created_at).toLocaleTimeString('vi-VN')}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${contact.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {contact.status === 'replied' ? 'Đã trả lời' : 'Chờ xử lý'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Email:</span> {contact.email}
                            {contact.phone && <span className="ml-4"><span className="font-medium">SĐT:</span> {contact.phone}</span>}
                          </div>
                          {contact.subject && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Chủ đề:</span> {contact.subject}
                            </div>
                          )}
                          <p className="text-gray-700 bg-white p-3 rounded border">{contact.message}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {contact.status !== 'replied' && (
                            <button 
                              onClick={() => handleUpdateContactStatus(contact.id, 'replied')}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Đánh dấu đã trả lời"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                      <input type="text" defaultValue="GoatTech Vietnam" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Email Liên Hệ</label>
                      <input type="email" defaultValue="contact@GoatTech.vn" className="w-full border rounded-lg px-3 py-2" />
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
                {modalType === 'add' ? 'Thêm Mới' : 'Chỉnh Sửa'} Sản Phẩm
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tên Sản Phẩm *</label>
                    <input 
                      type="text" 
                      value={formData.product_name}
                      onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Nhập tên sản phẩm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU *</label>
                    <input 
                      type="text" 
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="SP001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL Hình Ảnh</label>
                  <input 
                    type="text" 
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded border" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô Tả Ngắn</label>
                  <input 
                    type="text" 
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Mô tả ngắn gọn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô Tả Chi Tiết</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 h-24"
                    placeholder="Nhập mô tả chi tiết sản phẩm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá Gốc (VNĐ) *</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá Khuyến Mãi</label>
                    <input 
                      type="number" 
                      value={formData.sale_price}
                      onChange={(e) => setFormData({...formData, sale_price: Number(e.target.value)})}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Danh Mục</label>
                  <select 
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value ? Number(e.target.value) : null})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Sản phẩm nổi bật</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={formData.is_new}
                        onChange={(e) => setFormData({...formData, is_new: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Sản phẩm mới</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng thái</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ngừng bán</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bộ Sưu Tập Theo Mùa (Tùy chọn)</label>
                  <select 
                    value={formData.season}
                    onChange={(e) => setFormData({...formData, season: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">-- Không thuộc mùa nào --</option>
                    <option value="noel">🎄 Giáng Sinh - Noel</option>
                    <option value="valentine">💕 Valentine</option>
                    <option value="tet">🧧 Tết Nguyên Đán</option>
                  </select>
                </div>

                {/* Collections Multi-select */}
                {collections.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Bộ Sưu Tập (Chọn nhiều)</label>
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {collections.map((collection) => (
                        <label 
                          key={collection.collection_id} 
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCollections.includes(collection.collection_id)}
                            onChange={() => handleCollectionToggle(collection.collection_id)}
                            className="w-4 h-4 text-pink-600 rounded"
                          />
                          <span className="text-sm">
                            {collection.collection_name}
                            <span className="text-xs text-gray-400 ml-1">
                              ({collection.collection_type === 'seasonal' ? 'Theo mùa' : 'Chính'})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedCollections.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Đã chọn {selectedCollections.length} bộ sưu tập
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={handleSaveProduct}
                    disabled={loading}
                    className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-medium disabled:bg-gray-400"
                  >
                    {loading ? 'Đang xử lý...' : (modalType === 'add' ? 'Thêm Mới' : 'Cập Nhật')}
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

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {categoryModalType === 'add' ? 'Thêm Mới' : 'Chỉnh Sửa'} Danh Mục
              </h3>
              <button onClick={closeCategoryModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Danh Mục *</label>
                  <input 
                    type="text" 
                    value={categoryFormData.category_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim();
                      setCategoryFormData({...categoryFormData, category_name: name, category_slug: slug});
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Nhập tên danh mục"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slug</label>
                  <input 
                    type="text" 
                    value={categoryFormData.category_slug}
                    onChange={(e) => setCategoryFormData({...categoryFormData, category_slug: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                    placeholder="ten-danh-muc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mô Tả</label>
                  <textarea 
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 h-20"
                    placeholder="Nhập mô tả danh mục"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thứ Tự Hiển Thị</label>
                  <input 
                    type="number" 
                    value={categoryFormData.display_order}
                    onChange={(e) => setCategoryFormData({...categoryFormData, display_order: Number(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={categoryFormData.is_active}
                      onChange={(e) => setCategoryFormData({...categoryFormData, is_active: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Kích hoạt danh mục</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={handleSaveCategory}
                    disabled={loading}
                    className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 font-medium disabled:bg-gray-400"
                  >
                    {loading ? 'Đang xử lý...' : (categoryModalType === 'add' ? 'Thêm Mới' : 'Cập Nhật')}
                  </button>
                  <button 
                    type="button"
                    onClick={closeCategoryModal}
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
