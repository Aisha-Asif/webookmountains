import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient()

    let query = db
      .from('disputes')
      .select(`
        *,
        booking:bookings(id, trip_id, trip:trips(title, mountain), customer:users(full_name))
      `)
      .order('created_at', { ascending: false })

    if (session.role !== 'admin') {
      query = query.eq('raised_by', session.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { booking_id, issue_type, description } = await req.json()

    if (!booking_id || !issue_type || !description) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const db = createServiceClient()

    // Verify booking belongs to user
    const { data: booking } = await db
      .from('bookings')
      .select('id, customer_id, status')
      .eq('id', booking_id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.customer_id !== session.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data, error } = await db
      .from('disputes')
      .insert({
        booking_id,
        raised_by: session.id,
        issue_type,
        description,
        status: 'open',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 })

    // Update booking status to disputed
    await db.from('bookings').update({ status: 'disputed' }).eq('id', booking_id)

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
