import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED_PATHS = ['/dashboard', '/disputes/new', '/bookings']
const AUTH_PATHS = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('wbm_session')?.value

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    }
    const user = await verifyToken(token)
    if (!user) {
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('wbm_session')
      return response
    }
  }

  if (isAuthPage && token) {
    const user = await verifyToken(token)
    if (user) {
      return NextResponse.redirect(
        new URL(user.role === 'guide' ? '/dashboard/guide' : '/dashboard/customer', req.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/disputes/:path*',
    '/bookings/:path*',
    '/login',
    '/register',
  ],
}
