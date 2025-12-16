
// 'use client';

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   ReactNode,
// } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import type { User, Session } from '@supabase/supabase-js';

// // ============================================================================
// // TYPES
// // ============================================================================

// export enum UserRole {
//   ADMIN = 'admin',
//   CUSTOMER = 'customer',
//   GUEST = 'guest',
// }

// export interface AuthUser {
//   id: string;
//   email: string;
//   fullName?: string;
//   phone?: string;
//   role: UserRole;
// }

// interface AuthContextType {
//   user: AuthUser | null;
//   session: Session | null;
//   loading: boolean;
  
//   // Role checks
//   isAuthenticated: boolean;
//   isCustomer: boolean;
//   isAdmin: boolean;
  
//   // Actions
//   signIn: (email: string, password: string) => Promise<{ error?: string }>;
//   signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
//   signOut: () => Promise<void>;
//   refreshUser: () => Promise<void>;
// }

// // ============================================================================
// // CONTEXT
// // ============================================================================

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // API URL
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// // ============================================================================
// // PROVIDER
// // ============================================================================

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(true);
  
//   const supabase = createClientComponentClient();

//   // --------------------------------------------------------------------------
//   // Validate token với backend để lấy role
//   // --------------------------------------------------------------------------
//   const validateWithBackend = useCallback(async (accessToken: string): Promise<AuthUser | null> => {
//     try {
//       const response = await fetch(`${API_URL}/auth/validate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${accessToken}`,
//         },
//       });

//       if (!response.ok) {
//         console.error('Backend validation failed');
//         return null;
//       }

//       const data = await response.json();
      
//       if (data.valid && data.user) {
//         return {
//           id: data.user.id,
//           email: data.user.email,
//           fullName: data.user.fullName,
//           role: data.user.role as UserRole,
//         };
//       }

//       return null;
//     } catch (error) {
//       console.error('Error validating with backend:', error);
//       return null;
//     }
//   }, []);

//   // --------------------------------------------------------------------------
//   // Initialize auth state
//   // --------------------------------------------------------------------------
//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         const { data: { session: currentSession } } = await supabase.auth.getSession();
        
//         if (currentSession?.access_token) {
//           setSession(currentSession);
//           const validatedUser = await validateWithBackend(currentSession.access_token);
//           setUser(validatedUser);
//         }
//       } catch (error) {
//         console.error('Auth init error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initAuth();

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, newSession) => {
//         console.log('Auth state changed:', event);
//         setSession(newSession);
        
//         if (newSession?.access_token) {
//           const validatedUser = await validateWithBackend(newSession.access_token);
//           setUser(validatedUser);
//         } else {
//           setUser(null);
//         }
//       }
//     );

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [supabase, validateWithBackend]);

//   // --------------------------------------------------------------------------
//   // Sign In
//   // --------------------------------------------------------------------------
//   const signIn = async (email: string, password: string) => {
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         return { error: error.message };
//       }

//       if (data.session?.access_token) {
//         const validatedUser = await validateWithBackend(data.session.access_token);
//         setUser(validatedUser);
//         setSession(data.session);
//       }

//       return {};
//     } catch (error: any) {
//       return { error: error.message || 'Đăng nhập thất bại' };
//     }
//   };

//   // --------------------------------------------------------------------------
//   // Sign Up (mặc định role là CUSTOMER)
//   // --------------------------------------------------------------------------
//   const signUp = async (email: string, password: string, fullName: string) => {
//     try {
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             full_name: fullName,
//           },
//         },
//       });

//       if (error) {
//         return { error: error.message };
//       }

//       // Supabase sẽ trigger function tạo user record với role = 'customer'
//       return {};
//     } catch (error: any) {
//       return { error: error.message || 'Đăng ký thất bại' };
//     }
//   };

//   // --------------------------------------------------------------------------
//   // Sign Out
//   // --------------------------------------------------------------------------
//   const signOut = async () => {
//     await supabase.auth.signOut();
//     setUser(null);
//     setSession(null);
//   };

//   // --------------------------------------------------------------------------
//   // Refresh User
//   // --------------------------------------------------------------------------
//   const refreshUser = async () => {
//     if (session?.access_token) {
//       const validatedUser = await validateWithBackend(session.access_token);
//       setUser(validatedUser);
//     }
//   };

//   // --------------------------------------------------------------------------
//   // Context Value
//   // --------------------------------------------------------------------------
//   const value: AuthContextType = {
//     user,
//     session,
//     loading,
//     isAuthenticated: !!user,
//     isCustomer: user?.role === UserRole.CUSTOMER,
//     isAdmin: user?.role === UserRole.ADMIN,
//     signIn,
//     signUp,
//     signOut,
//     refreshUser,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // ============================================================================
// // HOOK
// // ============================================================================

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  GUEST = 'guest',
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;

  // Role checks
  isAuthenticated: boolean;
  isCustomer: boolean;
  isAdmin: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Supabase Client (Client-side)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // Validate token với backend để lấy role
  // --------------------------------------------------------------------------
  const validateWithBackend = useCallback(async (accessToken: string): Promise<AuthUser | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('Backend validation failed');
        return null;
      }

      const data = await response.json();

      if (data.valid && data.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          phone: data.user.phone,
          role: data.user.role as UserRole,
        };
      }

      return null;
    } catch (error) {
      console.error('Error validating with backend:', error);
      return null;
    }
  }, []);

  // --------------------------------------------------------------------------
  // Initialize auth state
  // --------------------------------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data.session;

        if (currentSession?.access_token) {
          setSession(currentSession);
          const validatedUser = await validateWithBackend(currentSession.access_token);
          setUser(validatedUser);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.access_token) {
          const validatedUser = await validateWithBackend(newSession.access_token);
          setUser(validatedUser);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [validateWithBackend]);

  // --------------------------------------------------------------------------
  // Sign In
  // --------------------------------------------------------------------------
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.session?.access_token) {
        const validatedUser = await validateWithBackend(data.session.access_token);
        setUser(validatedUser);
        setSession(data.session);
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Đăng nhập thất bại' };
    }
  };

  // --------------------------------------------------------------------------
  // Sign Up (mặc định role = CUSTOMER, backend handle)
  // --------------------------------------------------------------------------
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: error.message || 'Đăng ký thất bại' };
    }
  };

  // --------------------------------------------------------------------------
  // Sign Out
  // --------------------------------------------------------------------------
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // --------------------------------------------------------------------------
  // Refresh User
  // --------------------------------------------------------------------------
  const refreshUser = async () => {
    if (session?.access_token) {
      const validatedUser = await validateWithBackend(session.access_token);
      setUser(validatedUser);
    }
  };

  // --------------------------------------------------------------------------
  // Context Value
  // --------------------------------------------------------------------------
  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isCustomer: user?.role === UserRole.CUSTOMER,
    isAdmin: user?.role === UserRole.ADMIN,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
