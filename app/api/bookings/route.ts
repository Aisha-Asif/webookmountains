import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient()
    let query

    if (session.role === 'customer') {
      query = db
        .from('bookings')
        .select(`
          *,
          trip:trips(id, title, mountain, duration_days, image_url, difficulty),
          guide:guides(id, user:users(full_name))
        `)
        .eq('customer_id', session.id)
        .order('created_at', { ascending: false })
    } else if (session.role === 'guide') {
      const { data: guide } = await db
        .from('guides')
        .select('id')
        .eq('user_id', session.id)
        .single()

      if (!guide) return NextResponse.json({ error: 'Guide not found' }, { status: 404 })

      query = db
        .from('bookings')
        .select(`
          *,
          trip:trips(id, title, mountain, duration_days, image_url, difficulty),
          customer:users(id, full_name, username)
        `)
        .eq('guide_id', guide.id)
        .order('created_at', { ascending: false })
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can book trips' }, { status: 401 })
    }

    const { trip_id, trip_date, participants, special_requests } = await req.json()

    if (!trip_id || !trip_date || !participants) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const db = createServiceClient()

    // Get trip details
    const { data: trip } = await db
      .from('trips')
      .select('*, guide:guides(id)')
      .eq('id', trip_id)
      .eq('is_active', true)
      .single()

    if (!trip) return NextResponse.json({ error: 'Trip not found or unavailable' }, { status: 404 })

    const total_amount = trip.price_per_person * participants
    const deposit_amount = Math.round(total_amount * (trip.deposit_percent / 100))

    const { data: booking, error } = await db
      .from('bookings')
      .insert({
        trip_id,
        customer_id: session.id,
        guide_id: trip.guide.id,
        trip_date,
        participants: parseInt(participants),
        total_amount,
        deposit_amount,
        status: 'pending',
        payment_status: 'pending',
        special_requests: special_requests || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Booking error:', error)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    return NextResponse.json({ data: booking }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
