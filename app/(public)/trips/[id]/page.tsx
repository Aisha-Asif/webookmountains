import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BookingForm from '@/components/booking/BookingForm'
import {
  MapPin, Clock, Users, Star, Shield, CheckCircle,
  AlertTriangle, ChevronLeft, Award
} from 'lucide-react'
import { formatCurrency, difficultyColor, cn, cancellationPolicyText } from '@/lib/utils'

async function getTrip(id: string) {
  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('trips')
      .select(`
        *,
        guide:guides(
          id, bio, experience_years, specialties, certifications,
          is_verified, verification_status, rating, total_reviews, total_trips,
          user:users(id, full_name, username)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) return null

    const { data: reviews } = await db
      .from('reviews')
      .select('*, customer:users(full_name)')
      .eq('trip_id', id)
      .order('created_at', { ascending: false })
      .limit(6)

    return { ...data, reviews: reviews || [] }
  } catch {
    return null
  }
}

export default async function TripDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [trip, session] = await Promise.all([getTrip(params.id), getSession()])

  if (!trip) notFound()

  const guide = trip.guide as any
  const reviews = trip.reviews as any[]

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar user={session} />

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[360px] mt-16 overflow-hidden">
        <img
          src={trip.image_url || `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80`}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-100 mb-4 transition-colors">
              <ChevronLeft size={15} /> All expeditions
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <span className={cn('badge', difficultyColor(trip.difficulty))}>{trip.difficulty}</span>
              {guide?.is_verified && (
                <span className="badge bg-summit-900/70 text-summit-300 border border-summit-700/30">
                  <Shield size={10} className="mr-1" /> Verified guide
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl text-stone-50 max-w-3xl leading-tight">
              {trip.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: MapPin, label: 'Mountain', value: trip.mountain },
                { icon: Clock, label: 'Duration', value: `${trip.duration_days} days` },
                { icon: Users, label: 'Max group', value: `${trip.max_participants} people` },
                {
                  icon: Star,
                  label: 'Guide rating',
                  value: guide?.rating > 0 ? `${guide.rating} (${guide.total_reviews})` : 'New guide',
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-alpine-950/40 border border-white/6 rounded-xl p-4">
                  <Icon size={14} className="text-stone-500 mb-2" />
                  <p className="text-xs text-stone-500 mb-1">{label}</p>
                  <p className="text-sm font-medium text-stone-200">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-2xl text-stone-100 mb-4">About this expedition</h2>
              <p className="text-stone-400 leading-relaxed">{trip.description}</p>
            </div>

            {/* Includes */}
            {trip.includes?.length > 0 && (
              <div>
                <h3 className="font-display text-xl text-stone-100 mb-4">What's included</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {trip.includes.map((item: string) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-stone-300">
                      <CheckCircle size={14} className="text-summit-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {trip.requirements?.length > 0 && (
              <div>
                <h3 className="font-display text-xl text-stone-100 mb-4">Requirements</h3>
                <div className="space-y-2">
                  {trip.requirements.map((item: string) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-stone-400">
                      <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting point */}
            {trip.meeting_point && (
              <div>
                <h3 className="font-display text-xl text-stone-100 mb-2">Meeting point</h3>
                <div className="flex items-center gap-2 text-stone-400">
                  <MapPin size={14} className="text-summit-400" />
                  <span className="text-sm">{trip.meeting_point}</span>
                </div>
              </div>
            )}

            {/* Cancellation Policy */}
            <div className="bg-stone-900/40 border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-stone-200 mb-1">Cancellation policy</h3>
              <p className="text-sm text-stone-400">
                {cancellationPolicyText(trip.cancellation_policy)}
              </p>
              <p className="text-xs text-stone-600 mt-2">
                Deposits of {trip.deposit_percent}% required to confirm booking.
              </p>
            </div>

            {/* Guide profile */}
            {guide && (
              <div className="border border-white/8 rounded-2xl p-6">
                <h3 className="font-display text-xl text-stone-100 mb-5">Your guide</h3>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-alpine-800 flex items-center justify-center text-xl font-display text-stone-300 flex-shrink-0">
                    {guide.user?.full_name?.[0] || 'G'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-stone-100">{guide.user?.full_name}</p>
                      {guide.is_verified && (
                        <Shield size={13} className="text-summit-400" />
                      )}
                    </div>
                    <p className="text-sm text-stone-500 mb-3">
                      {guide.experience_years} years experience · {guide.total_trips} trips completed
                    </p>
                    {guide.bio && <p className="text-sm text-stone-400 leading-relaxed">{guide.bio}</p>}

                    {guide.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {guide.specialties.map((s: string) => (
                          <span key={s} className="text-xs bg-stone-800 text-stone-400 px-3 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {guide.certifications?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {guide.certifications.map((c: string) => (
                          <div key={c} className="flex items-center gap-1.5 text-xs text-stone-500">
                            <Award size={11} className="text-amber-400" />
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h3 className="font-display text-xl text-stone-100 mb-5">
                  Reviews ({reviews.length})
                </h3>
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border border-white/6 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-stone-200">
                          {review.customer?.full_name}
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-700'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-stone-400 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-alpine-950/50 border border-white/8 rounded-2xl p-6">
                <div className="mb-5">
                  <p className="text-stone-400 text-sm">From</p>
                  <p className="font-display text-3xl text-stone-100 mt-0.5">
                    {formatCurrency(trip.price_per_person)}
                    <span className="text-base font-normal text-stone-400 ml-1">/ person</span>
                  </p>
                  <p className="text-xs text-stone-600 mt-1">
                    {trip.deposit_percent}% deposit to confirm
                  </p>
                </div>

                <BookingForm
                  trip={trip as any}
                  session={session}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
