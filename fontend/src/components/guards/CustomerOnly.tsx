'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface CustomerOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;        // Hiển thị khi không có quyền
  showLoginPrompt?: boolean;   // Hiển thị link đăng nhập
}

/**
 * Component wrapper chỉ hiển thị nội dung cho CUSTOMER
 * 
 * Ví dụ sử dụng:
 * <CustomerOnly>
 *   <button onClick={addToCart}>Thêm vào giỏ hàng</button>
 * </CustomerOnly>
 */
export function CustomerOnly({
  children,
  fallback,
  showLoginPrompt = true,
}: CustomerOnlyProps) {
  const { user, isCustomer, loading, isAuthenticated } = useAuth();

  // Đang loading
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-32 rounded" />
    );
  }

  // Đã đăng nhập và là Customer -> hiển thị children
  if (isAuthenticated && isCustomer) {
    return <>{children}</>;
  }

  // Có fallback custom -> hiển thị fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Mặc định: hiển thị thông báo
  if (!isAuthenticated && showLoginPrompt) {
    return (
      <Link
        href="/login"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
      >
        Đăng nhập để tiếp tục
      </Link>
    );
  }

  // Đã đăng nhập nhưng không phải customer
  if (isAuthenticated && !isCustomer) {
    return (
      <span className="text-gray-500 text-sm">
        Chỉ khách hàng mới thực hiện được
      </span>
    );
  }

  return null;
}