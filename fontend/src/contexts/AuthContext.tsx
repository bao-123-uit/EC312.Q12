// File: fontend/src/app/context/auth-context.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id?: string;
  email: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  role?: string;
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  refreshAuth: () => void;
  getDisplayName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user từ localStorage khi mount
  useEffect(() => {
    refreshAuth();
  }, []);

  // Listen for storage changes (đồng bộ giữa các tab/components)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customer') {
        refreshAuth();
      }
    };

    // Custom event để đồng bộ trong cùng 1 tab
    const handleAuthChange = () => {
      refreshAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const refreshAuth = () => {
    try {
      const customerData = localStorage.getItem('customer');
      if (customerData) {
        const parsedUser = JSON.parse(customerData);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing customer data:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: AuthUser) => {
    localStorage.setItem('customer', JSON.stringify(userData));
    setUser(userData);
    // Dispatch event để các component khác biết
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('userRole');
    setUser(null);
    // Dispatch event để các component khác biết
    window.dispatchEvent(new Event('authChange'));
  };

  const getDisplayName = () => {
    if (!user) return '';
    return user.full_name || user.fullName || user.name || user.email?.split('@')[0] || 'User';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        refreshAuth,
        getDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}