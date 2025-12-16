// import { type NextRequest, NextResponse } from 'next/server';
// import { createServerClient } from '@supabase/ssr';

// export async function middleware(request: NextRequest) {
//   let response = NextResponse.next({ request: { headers: request.headers } });
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() { return request.cookies.getAll(); },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
//           response = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
//         },
//       },
//     }
//   );
//   const { data: { user } } = await supabase.auth.getUser();
  
//   // Các trang cần bảo vệ
//   if (request.nextUrl.pathname.startsWith('/account') &&!user) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
//   return response;
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// };
// import { type NextRequest, NextResponse } from 'next/server';
// import { createServerClient } from '@supabase/ssr';

// // Các route cần đăng nhập
// const PROTECTED_ROUTES = ['/account', '/shopping-cart', '/checkout', '/orders'];

// // Các route chỉ dành cho admin
// const ADMIN_ROUTES = ['/admin'];

// export async function middleware(request: NextRequest) {
//   let response = NextResponse.next({ request: { headers: request.headers } });
  
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
//           response = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             response.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   const { data: { user } } = await supabase.auth.getUser();
//   const pathname = request.nextUrl.pathname;

//   // Kiểm tra protected routes
//   const isProtectedRoute = PROTECTED_ROUTES.some(route => 
//     pathname.startsWith(route)
//   );
  
//   const isAdminRoute = ADMIN_ROUTES.some(route => 
//     pathname.startsWith(route)
//   );

//   // Chưa đăng nhập mà vào protected route -> redirect login
//   if (isProtectedRoute && !user) {
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('redirect', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Vào admin route -> cần kiểm tra role (sẽ kiểm tra ở component)
//   // Middleware chỉ kiểm tra đăng nhập, role check ở client/server component
//   if (isAdminRoute && !user) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return response;
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
// };
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_ROUTES = ['/account', '/shopping-cart', '/checkout', '/orders'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};





























































import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_ROUTES = ['/account', '/shopping-cart', '/checkout', '/orders'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
