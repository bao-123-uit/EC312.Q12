'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;         // Redirect nếu không có quyền
  fallback?: ReactNode;        // Hiển thị thay vì redirect
}

/**
 * Component bảo vệ route theo role
 * 
 * Ví dụ sử dụng:
 * <RoleGuard allowedRoles={[UserRole.CUSTOMER]} redirectTo="/login">
 *   <CheckoutPage />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  redirectTo,
  fallback,
}: RoleGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, redirectTo, router]);

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
      </div>
    );
  }

  // Kiểm tra role
  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          ⛔ Không có quyền truy cập
        </h2>
        <p className="text-gray-600">
          Bạn cần vai trò "{allowedRoles.join('" hoặc "')}" để xem trang này
        </p>
      </div>
    );
  }

  // Có quyền
  return <>{children}</>;
}