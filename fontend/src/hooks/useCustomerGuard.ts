'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UseCustomerGuardOptions {
  redirectTo?: string;
  onDenied?: () => void;
}

/**
 * Hook để kiểm tra và bảo vệ actions chỉ dành cho customer
 * 
 * Ví dụ sử dụng:
 * const { checkAndExecute, canExecute } = useCustomerGuard({ 
 *   redirectTo: '/login' 
 * });
 * 
 * // Trong handler
 * const handleAddToCart = () => {
 *   checkAndExecute(() => {
 *     // Logic thêm vào giỏ
 *   });
 * };
 */
export function useCustomerGuard(options: UseCustomerGuardOptions = {}) {
  const { user, isCustomer, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { redirectTo, onDenied } = options;

  // Có thể thực hiện action không?
  const canExecute = isAuthenticated && isCustomer;

  // Function wrap action
  const checkAndExecute = async (action: () => void | Promise<void>): Promise<boolean> => {
    // Chưa đăng nhập
    if (!isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      }
      onDenied?.();
      return false;
    }

    // Không phải customer
    if (!isCustomer) {
      console.warn('Action requires CUSTOMER role');
      onDenied?.();
      return false;
    }

    // Thực hiện action
    await action();
    return true;
  };

  // Require customer - redirect nếu không phải
  const requireCustomer = () => {
    if (!loading && !canExecute && redirectTo) {
      router.push(redirectTo);
    }
  };

  return {
    canExecute,
    isCustomer,
    isAuthenticated,
    loading,
    user,
    checkAndExecute,
    requireCustomer,
  };
}