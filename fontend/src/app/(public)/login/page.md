// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { loginCustomer } from '@/lib/api-client';
// import Link from 'next/link';
// import { Mail, Lock, AlertCircle } from 'lucide-react';

// export default function LoginPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     setError('');
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     if (!formData.email || !formData.password) {
//       setError('Vui lòng điền đầy đủ thông tin');
//       return;
//     }

//     setLoading(true);

//     try {
//       const result = await loginCustomer(formData.email, formData.password);

//       if (result.success) {
//         // Lưu thông tin user vào localStorage (dùng bảng users)
//         const user = result.customer || result.user;
//         localStorage.setItem('customer', JSON.stringify(user));
        
//         // Kiểm tra role admin (từ database hoặc email chứa 'admin')
//         const isAdmin = result.role === 'admin' || 
//                         user?.role === 'admin' || 
//                         user?.email?.toLowerCase().includes('admin');
        
//         localStorage.setItem('userRole', isAdmin ? 'admin' : 'customer');
        
//         // Redirect dựa trên role
//         if (isAdmin) {
//           router.push('/admin');
//         } else {
//           router.push('/');
//         }
//       } else {
//         setError(result.message || 'Đăng nhập thất bại');
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
//         {/* Header */}
//         <div>
//           <h2 className="text-center text-4xl font-extrabold text-gray-900">
//             Đăng nhập
//           </h2>
//           <p className="mt-2 text-center text-sm text-gray-600">
//             Hoặc{' '}
//             <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
//               Tạo tài khoản mới
//             </Link>
//           </p>
//         </div>

//         {/* Alert */}
//         {error && (
//           <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
//             <div className="flex items-center">
//               <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
//               <p className="text-sm text-red-700">{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Form */}
//         <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="example@email.com"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Mật khẩu
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Remember & Forgot */}
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <input
//                 id="remember-me"
//                 name="remember-me"
//                 type="checkbox"
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                 Ghi nhớ đăng nhập
//               </label>
//             </div>

//             <div className="text-sm">
//               <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
//                 Quên mật khẩu?
//               </Link>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
//                 loading
//                   ? 'bg-blue-400 cursor-not-allowed'
//                   : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
//               }`}
//             >
//               {loading ? (
//                 <span className="flex items-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Đang xử lý...
//                 </span>
//               ) : (
//                 'Đăng nhập'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
// File: fontend/src/app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginCustomer } from '@/lib/api-client';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, User, LogOut, Settings, ShoppingBag, Heart, Edit } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State cho user đã đăng nhập
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Kiểm tra đăng nhập khi vào trang
  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      try {
        const parsedUser = JSON.parse(customerData);
        setLoggedInUser(parsedUser);
      } catch (error) {
        console.error('Error parsing customer data:', error);
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);

    try {
      const result = await loginCustomer(formData.email, formData.password);

      if (result.success) {
        const user = result.customer || result.user;
        localStorage.setItem('customer', JSON.stringify(user));
        
        const isAdmin = result.role === 'admin' || 
                        user?.role === 'admin' || 
                        user?.email?.toLowerCase().includes('admin');
        
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'customer');
        
        // Cập nhật state
        setLoggedInUser(user);
        
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('userRole');
    setLoggedInUser(null);
  };

  // Lấy tên hiển thị
  const getDisplayName = () => {
    if (!loggedInUser) return '';
    return loggedInUser.full_name || loggedInUser.fullName || loggedInUser.name || loggedInUser.email?.split('@')[0] || 'User';
  };

  // Lấy role
  const getUserRole = () => {
    const role = localStorage.getItem('userRole');
    return role === 'admin' ? 'Quản trị viên' : 'Khách hàng';
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NẾU ĐÃ ĐĂNG NHẬP - HIỂN THỊ THÔNG TIN TÀI KHOẢN
  // ═══════════════════════════════════════════════════════════════════════════
  if (loggedInUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Card thông tin tài khoản */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header với avatar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg">
                {getDisplayName().charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {getDisplayName()}
              </h2>
              <p className="mt-1 text-blue-100">
                {loggedInUser.email}
              </p>
              <span className="inline-block mt-3 px-4 py-1 bg-white/20 rounded-full text-sm text-white">
                {getUserRole()}
              </span>
            </div>

            {/* Thông tin chi tiết */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin tài khoản
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Email</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {loggedInUser.email}
                  </span>
                </div>

                {/* Tên */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Họ và tên</span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {getDisplayName()}
                  </span>
                </div>

                {/* Số điện thoại */}
                {loggedInUser.phone && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📱</span>
                      <span className="text-gray-600">Số điện thoại</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {loggedInUser.phone}
                    </span>
                  </div>
                )}

                {/* Vai trò */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Vai trò</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    loggedInUser.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {getUserRole()}
                  </span>
                </div>

                {/* Ngày tạo tài khoản */}
                {loggedInUser.created_at && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📅</span>
                      <span className="text-gray-600">Ngày tham gia</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {new Date(loggedInUser.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Link
                  href="/account"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  <Edit className="w-5 h-5" />
                  Chỉnh sửa
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Đơn hàng
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition font-medium"
                >
                  <Heart className="w-5 h-5" />
                  Yêu thích
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </div>

              {/* Link admin nếu là admin */}
              {loggedInUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  <Settings className="w-5 h-5" />
                  Trang quản trị
                </Link>
              )}
            </div>
          </div>

          {/* Link tiếp tục mua sắm */}
          <div className="mt-6 text-center">
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHƯA ĐĂNG NHẬP - HIỂN THỊ FORM ĐĂNG NHẬP (GIỮ NGUYÊN CODE CŨ)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div>
          <h2 className="text-center text-4xl font-extrabold text-gray-900">
            Đăng nhập
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Tạo tài khoản mới
            </Link>
          </p>
        </div>

        {/* Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}













































































































// File: fontend/src/app/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginCustomer } from '@/lib/api-client';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, User, LogOut, Settings, ShoppingBag, Heart, Edit } from 'lucide-react';
// import { useAuth } from '@/app/context/auth-context';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout, getDisplayName, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitLoading(true);

    try {
      const result = await loginCustomer(formData.email, formData.password);

      if (result.success) {
        const userData = result.customer || result.user;
        
        // Sử dụng AuthContext để login
        login(userData);
        
        const isAdmin = result.role === 'admin' || 
                        userData?.role === 'admin' || 
                        userData?.email?.toLowerCase().includes('admin');
        
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'customer');
        
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    logout();
  };

  // Lấy role
  const getUserRole = () => {
    const role = localStorage.getItem('userRole');
    return role === 'admin' ? 'Quản trị viên' : 'Khách hàng';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NẾU ĐÃ ĐĂNG NHẬP - HIỂN THỊ THÔNG TIN TÀI KHOẢN
  // ═══════════════════════════════════════════════════════════════════════════
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Card thông tin tài khoản */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header với avatar */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg">
                {getDisplayName().charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {getDisplayName()}
              </h2>
              <p className="mt-1 text-blue-100">
                {user.email}
              </p>
              <span className="inline-block mt-3 px-4 py-1 bg-white/20 rounded-full text-sm text-white">
                {getUserRole()}
              </span>
            </div>

            {/* Thông tin chi tiết */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin tài khoản
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Email</span>
                  </div>
                  <span className="text-gray-900 font-medium">{user.email}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Họ và tên</span>
                  </div>
                  <span className="text-gray-900 font-medium">{getDisplayName()}</span>
                </div>

                {user.phone && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📱</span>
                      <span className="text-gray-600">Số điện thoại</span>
                    </div>
                    <span className="text-gray-900 font-medium">{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Vai trò</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {getUserRole()}
                  </span>
                </div>

                {user.created_at && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📅</span>
                      <span className="text-gray-600">Ngày tham gia</span>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <Link
                  href="/account"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  <Edit className="w-5 h-5" />
                  Chỉnh sửa
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Đơn hàng
                </Link>

                <Link
                  href="/wishlist"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition font-medium"
                >
                  <Heart className="w-5 h-5" />
                  Yêu thích
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </div>

              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  <Settings className="w-5 h-5" />
                  Trang quản trị
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/shop" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHƯA ĐĂNG NHẬP - HIỂN THỊ FORM ĐĂNG NHẬP
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-gray-900">Đăng nhập</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Tạo tài khoản mới
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                submitLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {submitLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}