import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = createServiceClient()

    const { data, error } = await db
      .from('trips')
      .select(`
        *,
        guide:guides(
          id, bio, experience_years, specialties, certifications,
          is_verified, verification_status, rating, total_reviews, total_trips,
          user:users(id, full_name, username, avatar_url)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // Fetch reviews for this trip
    const { data: reviews } = await db
      .from('reviews')
      .select('*, customer:users(full_name, username)')
      .eq('trip_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({ data: { ...data, reviews: reviews || [] } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = createServiceClient()
    const { data: guide } = await db
      .from('guides')
      .select('id')
      .eq('user_id', session.id)
      .single()

    if (!guide) return NextResponse.json({ error: 'Guide not found' }, { status: 404 })

    const body = await req.json()

    const { data, error } = await db
      .from('trips')
      .update(body)
      .eq('id', params.id)
      .eq('guide_id', guide.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
