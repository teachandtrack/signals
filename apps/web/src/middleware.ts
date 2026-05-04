import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('sigint_session');
  const { pathname } = request.nextUrl;

  // Allow login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.includes('/favicon')) {
    return NextResponse.next();
  }

  // Redirect to login if no session
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
