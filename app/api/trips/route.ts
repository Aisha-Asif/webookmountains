import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const db = createServiceClient()
    const { searchParams } = new URL(req.url)
    const difficulty = searchParams.get('difficulty')
    const mountain = searchParams.get('mountain')
    const guide_id = searchParams.get('guide_id')

    let query = db
      .from('trips')
      .select(`
        *,
        guide:guides(
          id, is_verified, verification_status, rating, total_reviews, total_trips,
          user:users(id, full_name, username)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (difficulty) query = query.eq('difficulty', difficulty)
    if (mountain) query = query.ilike('mountain', `%${mountain}%`)
    if (guide_id) query = query.eq('guide_id', guide_id)

    const { data, error } = await query

    if (error) {
      console.error('Trips fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'guide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = createServiceClient()

    // Get guide profile
    const { data: guide } = await db
      .from('guides')
      .select('id, is_verified')
      .eq('user_id', session.id)
      .single()

    if (!guide) {
      return NextResponse.json({ error: 'Guide profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const {
      title, description, mountain, difficulty, duration_days,
      max_participants, price_per_person, deposit_percent,
      cancellation_policy, includes, requirements, meeting_point, image_url
    } = body

    if (!title || !description || !mountain || !difficulty || !duration_days || !price_per_person) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const { data, error } = await db
      .from('trips')
      .insert({
        guide_id: guide.id,
        title, description, mountain, difficulty,
        duration_days: parseInt(duration_days),
        max_participants: parseInt(max_participants) || 8,
        price_per_person: parseFloat(price_per_person),
        deposit_percent: parseInt(deposit_percent) || 30,
        cancellation_policy: cancellation_policy || 'moderate',
        includes: includes || [],
        requirements: requirements || [],
        meeting_point: meeting_point || '',
        image_url: image_url || '',
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Trip create error:', error)
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
