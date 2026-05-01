import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServiceClient } from '@/lib/supabase'
import { signToken } from '@/lib/auth'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { username, password, full_name, role } = await req.json()

    if (!username || !password || !full_name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ error: 'Username must be 3–30 characters' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (!['customer', 'guide'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const db = createServiceClient()

    // Check username uniqueness
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 12)

    const { data: user, error } = await db
      .from('users')
      .insert({
        username: username.toLowerCase(),
        password_hash,
        full_name,
        role: role as UserRole,
      })
      .select('id, username, full_name, role')
      .single()

    if (error || !user) {
      console.error('DB error:', error)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // If guide, create guide profile
    if (role === 'guide') {
      await db.from('guides').insert({
        user_id: user.id,
        bio: '',
        experience_years: 0,
        specialties: [],
        certifications: [],
        is_verified: false,
        verification_status: 'pending',
        rating: 0,
        total_reviews: 0,
        total_trips: 0,
        payout_account_set: false,
      })
    }

    const token = await signToken({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
    })

    const response = NextResponse.json({ user }, { status: 201 })
    response.cookies.set('wbm_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
