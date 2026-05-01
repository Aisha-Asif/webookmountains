import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { booking_id, rating, comment } = await req.json()

    if (!booking_id || !rating || !comment) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    const db = createServiceClient()

    // Verify booking is completed and belongs to user
    const { data: booking } = await db
      .from('bookings')
      .select('id, trip_id, guide_id, customer_id, status')
      .eq('id', booking_id)
      .eq('customer_id', session.id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed trips' }, { status: 400 })
    }

    // Check if already reviewed
    const { data: existing } = await db
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Trip already reviewed' }, { status: 409 })
    }

    const { data, error } = await db
      .from('reviews')
      .insert({
        booking_id,
        trip_id: booking.trip_id,
        customer_id: session.id,
        guide_id: booking.guide_id,
        rating,
        comment,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })

    // Update guide rating
    const { data: allReviews } = await db
      .from('reviews')
      .select('rating')
      .eq('guide_id', booking.guide_id)

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      await db.from('guides').update({
        rating: Math.round(avgRating * 10) / 10,
        total_reviews: allReviews.length,
      }).eq('id', booking.guide_id)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
