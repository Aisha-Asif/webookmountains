import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import {
  Mountain, Shield, Plus, Users, DollarSign,
  Star, AlertTriangle, CheckCircle, XCircle,
  Clock3, ArrowRight, Edit
} from 'lucide-react'
import { formatCurrency, formatDate, statusColor, cn } from '@/lib/utils'

async function getGuideDashboardData(userId: string) {
  const db = createServiceClient()

  const { data: guide } = await db
    .from('guides')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!guide) return null

  const { data: trips } = await db
    .from('trips')
    .select('id, title, mountain, difficulty, price_per_person, is_active, duration_days')
    .eq('guide_id', guide.id)
    .order('created_at', { ascending: false })

  const { data: bookings } = await db
    .from('bookings')
    .select(`
      id, trip_date, participants, total_amount, status, payment_status, created_at,
      trip:trips(title, mountain),
      customer:users(full_name, username)
    `)
    .eq('guide_id', guide.id)
    .order('created_at', { ascending: false })

  return { guide, trips: trips || [], bookings: bookings || [] }
}

export default async function GuideDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'guide') redirect('/dashboard/customer')

  const data = await getGuideDashboardData(session.id)

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400">Guide profile not found. Please contact support.</p>
      </div>
    )
  }

  const { guide, trips, bookings } = data

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.total_amount, 0)

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar user={session} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-stone-500 text-sm">Guide dashboard</p>
              {guide.is_verified ? (
                <span className="badge bg-summit-900/50 text-summit-300 border border-summit-700/30">
                  <Shield size={9} className="mr-1" /> Verified
                </span>
              ) : (
                <span className="badge bg-amber-900/30 text-amber-400 border border-amber-700/30">
                  Verification {guide.verification_status}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl text-stone-100">{session.full_name}</h1>
            <div className="flex items-center gap-3 mt-1">
              {guide.rating > 0 && (
                <span className="flex items-center gap-1 text-sm text-stone-400">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  {guide.rating} ({guide.total_reviews} reviews)
                </span>
              )}
              <span className="text-sm text-stone-500">{guide.total_trips} trips completed</span>
            </div>
          </div>
          <Link href="/dashboard/guide/new-trip" className="btn btn-primary">
            <Plus size={15} />
            New trip
          </Link>
        </div>

        {/* Verification notice */}
        {!guide.is_verified && (
          <div className="bg-amber-950/20 border border-amber-700/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-200 mb-1">Verification pending</p>
              <p className="text-sm text-amber-700">
                Your guide profile is under review. Your trips will be listed with an "unverified" notice until approval.
                Make sure your certifications and ID documents are up to date.
              </p>
            </div>
          </div>
        )}

        {!guide.payout_account_set && (
          <div className="bg-alpine-950/30 border border-alpine-700/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <DollarSign size={18} className="text-alpine-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-alpine-200 mb-1">Payout account not set</p>
              <p className="text-sm text-alpine-600">
                Set up your payout account to receive payments for completed trips. Contact support to complete setup.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active listings', val: trips.filter(t => t.is_active).length, icon: Mountain },
            { label: 'Pending requests', val: pendingBookings.length, icon: Clock3 },
            { label: 'Active bookings', val: confirmedBookings.length, icon: Users },
            { label: 'Total earned', val: formatCurrency(totalEarnings), icon: DollarSign },
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="stat-card flex flex-col gap-2">
              <Icon size={16} className="text-stone-600" />
              <p className="font-display text-2xl text-stone-100">{val}</p>
              <p className="text-xs text-stone-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending bookings */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-stone-100">Booking requests</h2>
              {pendingBookings.length > 0 && (
                <span className="badge bg-amber-900/30 text-amber-400 border border-amber-700/30">
                  {pendingBookings.length} pending
                </span>
              )}
            </div>

            {pendingBookings.length === 0 ? (
              <div className="border border-white/5 rounded-xl p-8 text-center">
                <CheckCircle size={28} className="text-stone-700 mx-auto mb-2" />
                <p className="text-stone-500 text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map(booking => {
                  const trip = booking.trip as any
                  const customer = booking.customer as any
                  return (
                    <div key={booking.id} className="bg-alpine-950/40 border border-white/6 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-stone-200">{trip?.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {customer?.full_name} · {booking.participants} person{booking.participants !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-stone-600 mt-1">{formatDate(booking.trip_date)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-stone-200">{formatCurrency(booking.total_amount)}</p>
                          <div className="flex gap-2 mt-2">
                            <ConfirmButton bookingId={booking.id} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* My trips */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-stone-100">My expeditions</h2>
              <Link href="/dashboard/guide/new-trip" className="text-xs text-summit-400 hover:underline flex items-center gap-1">
                Add new <ArrowRight size={11} />
              </Link>
            </div>

            {trips.length === 0 ? (
              <div className="border border-white/5 rounded-xl p-8 text-center">
                <Mountain size={28} className="text-stone-700 mx-auto mb-2" />
                <p className="text-stone-500 text-sm mb-3">No trips created yet</p>
                <Link href="/dashboard/guide/new-trip" className="btn btn-primary text-sm px-4 py-2">
                  Create your first trip
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map(trip => (
                  <div key={trip.id} className="bg-stone-900/30 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-stone-200">{trip.title}</p>
                      <div className="flex items-center gap-2 text-xs text-stone-600 mt-0.5">
                        <span>{trip.mountain}</span>
                        <span>·</span>
                        <span>{formatCurrency(trip.price_per_person)}/person</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('badge border text-xs', trip.is_active ? 'text-summit-400 border-summit-700/30 bg-summit-900/30' : 'text-stone-500 border-stone-700/30 bg-stone-900/30')}>
                        {trip.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Link href={`/trips/${trip.id}`} className="p-1.5 rounded-lg hover:bg-white/5 text-stone-500 hover:text-stone-300 transition-colors">
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Recent bookings */}
        {bookings.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl text-stone-100 mb-5">All bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-stone-500 pb-3 font-medium">Customer</th>
                    <th className="text-left text-xs text-stone-500 pb-3 font-medium">Trip</th>
                    <th className="text-left text-xs text-stone-500 pb-3 font-medium">Date</th>
                    <th className="text-left text-xs text-stone-500 pb-3 font-medium">Amount</th>
                    <th className="text-left text-xs text-stone-500 pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/3">
                  {bookings.slice(0, 10).map(booking => {
                    const trip = booking.trip as any
                    const customer = booking.customer as any
                    return (
                      <tr key={booking.id}>
                        <td className="py-3 text-stone-300">{customer?.full_name}</td>
                        <td className="py-3 text-stone-400">{trip?.title}</td>
                        <td className="py-3 text-stone-500">{formatDate(booking.trip_date)}</td>
                        <td className="py-3 text-stone-300">{formatCurrency(booking.total_amount)}</td>
                        <td className="py-3">
                          <span className={cn('badge border text-xs', statusColor(booking.status))}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// Simple client action button (inline for simplicity)
function ConfirmButton({ bookingId }: { bookingId: string }) {
  return (
    <form action={`/api/bookings/${bookingId}`} method="POST">
      <Link
        href={`/dashboard/guide/booking/${bookingId}`}
        className="text-xs px-3 py-1.5 bg-summit-800/50 hover:bg-summit-700/50 text-summit-300 rounded-lg transition-colors border border-summit-700/30"
      >
        Review
      </Link>
    </form>
  )
}
