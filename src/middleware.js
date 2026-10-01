import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next internals, public assets, and auth APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/logout') ||
    pathname.startsWith('/api/image-proxy') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('destifc_admin_auth');
  let isAuthenticated = false;

  if (authCookie && authCookie.value) {
    if (authCookie.value.includes('authenticated')) {
      isAuthenticated = true;
    } else {
      try {
        const decoded = JSON.parse(Buffer.from(authCookie.value, 'base64').toString('utf-8'));
        if (decoded && decoded.username) {
          isAuthenticated = true;
        }
      } catch (e) {
        isAuthenticated = false;
      }
    }
  }

  // If unauthenticated and visiting any portal page, redirect to /login
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
