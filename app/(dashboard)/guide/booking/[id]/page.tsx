import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import BookingActions from './BookingActions'
import { ChevronLeft, Calendar, Users, MapPin, DollarSign, User, MessageSquare } from 'lucide-react'
import { formatCurrency, formatDate, statusColor, cn } from '@/lib/utils'

async function getBooking(id: string, guideUserId: string) {
  const db = createServiceClient()
  const { data: guide } = await db.from('guides').select('id').eq('user_id', guideUserId).single()
  if (!guide) return null

  const { data } = await db
    .from('bookings')
    .select(`
      *,
      trip:trips(title, mountain, duration_days, difficulty),
      customer:users(full_name, username)
    `)
    .eq('id', id)
    .eq('guide_id', guide.id)
    .single()
  return data
}

export default async function BookingReviewPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'guide') redirect('/dashboard/customer')

  const booking = await getBooking(params.id, session.id)
  if (!booking) notFound()

  const trip = booking.trip as any
  const customer = booking.customer as any

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar user={session} />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <Link href="/dashboard/guide" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-100 mb-6">
          <ChevronLeft size={15} /> Guide dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl text-stone-100">Booking request</h1>
          <span className={cn('badge border', statusColor(booking.status))}>{booking.status}</span>
        </div>

        <div className="bg-alpine-950/40 border border-white/8 rounded-2xl p-6 space-y-5">
          {/* Trip info */}
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Trip</p>
            <p className="font-display text-xl text-stone-100">{trip?.title}</p>
            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
              <span className="flex items-center gap-1"><MapPin size={10} />{trip?.mountain}</span>
              <span>{trip?.duration_days} days</span>
              <span className="capitalize">{trip?.difficulty}</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Customer */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-alpine-800 flex items-center justify-center">
              <User size={16} className="text-stone-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-200">{customer?.full_name}</p>
              <p className="text-xs text-stone-500">@{customer?.username}</p>
            </div>
          </div>

          <hr className="divider" />

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Calendar size={10} />Trip date</p>
              <p className="text-sm text-stone-200 font-medium">{formatDate(booking.trip_date)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1 flex items-center gap-1"><Users size={10} />Participants</p>
              <p className="text-sm text-stone-200 font-medium">{booking.participants} person{booking.participants !== 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1 flex items-center gap-1"><DollarSign size={10} />Total amount</p>
              <p className="text-sm text-stone-200 font-medium">{formatCurrency(booking.total_amount)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Deposit paid</p>
              <p className="text-sm text-stone-200 font-medium">{formatCurrency(booking.deposit_amount)}</p>
            </div>
          </div>

          {booking.special_requests && (
            <>
              <hr className="divider" />
              <div>
                <p className="text-xs text-stone-500 mb-2 flex items-center gap-1"><MessageSquare size={10} />Special requests</p>
                <p className="text-sm text-stone-400 bg-stone-900/50 rounded-lg p-3">{booking.special_requests}</p>
              </div>
            </>
          )}

          <hr className="divider" />

          {/* Actions */}
          <BookingActions bookingId={booking.id} currentStatus={booking.status} />
        </div>
      </div>
    </div>
  )
}
