import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const db = createServiceClient()
    const { searchParams } = new URL(req.url)
    const verified_only = searchParams.get('verified') === 'true'

    let query = db
      .from('guides')
      .select(`
        id, bio, experience_years, specialties, certifications,
        is_verified, verification_status, rating, total_reviews, total_trips,
        user:users(id, full_name, username, avatar_url)
      `)
      .order('rating', { ascending: false })

    if (verified_only) query = query.eq('is_verified', true)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = createServiceClient()
    const body = await req.json()
    const { bio, experience_years, specialties, certifications, payout_account_set } = body

    const { data, error } = await db
      .from('guides')
      .update({ bio, experience_years, specialties, certifications, payout_account_set })
      .eq('user_id', session.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
