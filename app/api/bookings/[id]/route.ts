import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient()

    const { data, error } = await db
      .from('bookings')
      .select(`
        *,
        trip:trips(*, guide:guides(id, user:users(full_name, username))),
        customer:users(id, full_name, username)
      `)
      .eq('id', params.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Access control: customer sees own bookings, guide sees their bookings
    const isOwner = data.customer_id === session.id
    const isGuide = session.role === 'guide'

    if (!isOwner && !isGuide && session.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ data })
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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = createServiceClient()
    const body = await req.json()
    const { status, payment_status } = body

    // Get booking
    const { data: booking } = await db
      .from('bookings')
      .select('*, guide:guides(user_id)')
      .eq('id', params.id)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Permissions
    const isCustomer = booking.customer_id === session.id
    const isGuide = booking.guide?.user_id === session.id

    if (!isCustomer && !isGuide && session.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Guides can confirm/complete; customers can cancel (with rules)
    const updates: Record<string, string> = {}
    if (status) updates.status = status
    if (payment_status) updates.payment_status = payment_status

    const { data, error } = await db
      .from('bookings')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
