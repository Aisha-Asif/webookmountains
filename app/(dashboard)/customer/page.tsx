import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import {
  Mountain, Calendar, MapPin, Clock, Star,
  AlertTriangle, CheckCircle, XCircle, Clock3,
  Plus, ChevronRight
} from 'lucide-react'
import { formatCurrency, formatDate, statusColor, cn } from '@/lib/utils'

async function getDashboardData(userId: string) {
  const db = createServiceClient()

  const { data: bookings } = await db
    .from('bookings')
    .select(`
      id, trip_date, participants, total_amount, deposit_amount,
      status, payment_status, created_at,
      trip:trips(id, title, mountain, duration_days, image_url, difficulty)
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  const { data: disputes } = await db
    .from('disputes')
    .select('id, issue_type, status, created_at, booking_id')
    .eq('raised_by', userId)
    .order('created_at', { ascending: false })

  return { bookings: bookings || [], disputes: disputes || [] }
}

const statusIcons = {
  pending: Clock3,
  confirmed: CheckCircle,
  completed: Star,
  cancelled: XCircle,
  disputed: AlertTriangle,
}

export default async function CustomerDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'customer') redirect('/dashboard/guide')

  const { bookings, disputes } = await getDashboardData(session.id)

  const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status))
  const past = bookings.filter(b => ['completed', 'cancelled', 'disputed'].includes(b.status))

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar user={session} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-stone-500 text-sm mb-1">Welcome back</p>
            <h1 className="font-display text-3xl text-stone-100">{session.full_name}</h1>
          </div>
          <Link href="/trips" className="btn btn-primary">
            <Plus size={15} />
            Book a trip
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total bookings', val: bookings.length },
            { label: 'Upcoming trips', val: upcoming.length },
            { label: 'Completed trips', val: bookings.filter(b => b.status === 'completed').length },
            { label: 'Open disputes', val: disputes.filter(d => d.status === 'open').length },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="font-display text-2xl text-stone-100">{s.val}</p>
              <p className="text-xs text-stone-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming bookings */}
        <section className="mb-10">
          <h2 className="font-display text-xl text-stone-100 mb-5">Upcoming expeditions</h2>

          {upcoming.length === 0 ? (
            <div className="border border-white/5 rounded-2xl p-10 text-center">
              <Mountain size={36} className="text-stone-700 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">No upcoming trips</p>
              <Link href="/trips" className="btn btn-primary">
                Browse expeditions
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map(booking => {
                const trip = booking.trip as any
                const StatusIcon = statusIcons[booking.status as keyof typeof statusIcons] || Clock3
                const isNear24h = new Date(booking.trip_date).getTime() - Date.now() < 24 * 60 * 60 * 1000

                return (
                  <div
                    key={booking.id}
                    className={cn(
                      'bg-alpine-950/40 border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4',
                      isNear24h ? 'border-amber-700/40 bg-amber-950/10' : 'border-white/6'
                    )}
                  >
                    {isNear24h && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-900/30 border border-amber-700/30 rounded-full px-3 py-1 mb-2 sm:mb-0">
                        <AlertTriangle size={11} />
                        Trip within 24 hours — contact support if needed
                      </div>
                    )}
                    <div className="flex items-center gap-4 flex-1 w-full">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-800">
                        {trip?.image_url ? (
                          <img src={trip.image_url} alt={trip?.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Mountain size={20} className="text-stone-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-stone-100 truncate">
                          {trip?.title || 'Trip'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                          <span className="flex items-center gap-1"><MapPin size={10} />{trip?.mountain}</span>
                          <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(booking.trip_date)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={cn('badge border', statusColor(booking.status))}>
                          {booking.status}
                        </span>
                        <p className="text-sm font-medium text-stone-200 mt-2">
                          {formatCurrency(booking.total_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Past trips */}
        {past.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl text-stone-100 mb-5">Past expeditions</h2>
            <div className="space-y-3">
              {past.map(booking => {
                const trip = booking.trip as any
                return (
                  <div key={booking.id} className="bg-stone-900/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-300">{trip?.title}</p>
                      <div className="flex items-center gap-3 text-xs text-stone-600 mt-0.5">
                        <span>{trip?.mountain}</span>
                        <span>{formatDate(booking.trip_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn('badge border text-xs', statusColor(booking.status))}>
                        {booking.status}
                      </span>
                      {booking.status === 'completed' && (
                        <Link
                          href={`/bookings/${booking.id}/review`}
                          className="text-xs text-summit-400 hover:underline"
                        >
                          Leave review
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Disputes */}
        {disputes.length > 0 && (
          <section>
            <h2 className="font-display text-xl text-stone-100 mb-5">Disputes</h2>
            <div className="space-y-3">
              {disputes.map(dispute => (
                <div key={dispute.id} className="bg-orange-950/20 border border-orange-800/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-300">
                      {dispute.issue_type.replace('_', ' ')} dispute
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      Opened {formatDate(dispute.created_at)}
                    </p>
                  </div>
                  <span className={cn('badge border', statusColor(dispute.status === 'open' ? 'pending' : dispute.status))}>
                    {dispute.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
