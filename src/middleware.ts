// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('🔍 Middleware called for:', req.nextUrl.pathname);
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Also check for session to handle client-side login timing
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('👤 User status:', user ? 'authenticated' : 'not authenticated');
  console.log('🔑 Session status:', session ? 'active' : 'no session');
  console.log('📍 Current path:', req.nextUrl.pathname);

  // Check if user is authenticated (either user object or active session)
  const isAuthenticated = user || session;

  // Redirect root path to login if not authenticated
  if (!isAuthenticated && req.nextUrl.pathname === '/') {
    console.log('🔄 Redirecting root to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protect /review route
  if (!isAuthenticated && req.nextUrl.pathname.startsWith('/review')) {
    console.log('🔄 Redirecting /review to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Redirect logged-in users from login to review
  if (isAuthenticated && req.nextUrl.pathname === '/login') {
    console.log('🔄 Redirecting authenticated user to /review');
    return NextResponse.redirect(new URL('/review', req.url));
  }

  console.log('✅ Middleware completed, continuing to page');
  return response;
}

export const config = {
  matcher: ['/', '/review/:path*', '/login'],
};
