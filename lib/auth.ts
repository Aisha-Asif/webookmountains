import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { AuthUser } from '@/types'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production-32chars'
)

export async function signToken(payload: AuthUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('wbm_session')?.value
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export function isWithin24Hours(tripDate: string): boolean {
  const trip = new Date(tripDate)
  const now = new Date()
  const diffMs = trip.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours >= 0 && diffHours <= 24
}
