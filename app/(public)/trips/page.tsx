import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import TripCard from '@/components/booking/TripCard'
import { Mountain, SlidersHorizontal } from 'lucide-react'
import type { Trip } from '@/types'

async function getTrips(difficulty?: string): Promise<Trip[]> {
  try {
    const db = createServiceClient()
    let query = db
      .from('trips')
      .select(`
        *,
        guide:guides(
          id, is_verified, rating, total_reviews, total_trips,
          user:users(id, full_name, username)
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    const { data } = await query
    return data || []
  } catch {
    return []
  }
}

export default async function TripsPage({
  searchParams,
}: {
  searchParams: { difficulty?: string; mountain?: string }
}) {
  const [trips, session] = await Promise.all([
    getTrips(searchParams.difficulty),
    getSession(),
  ])

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced', 'expert']
  const activeDifficulty = searchParams.difficulty || 'all'

  const filteredTrips = searchParams.mountain
    ? trips.filter(t => t.mountain.toLowerCase().includes(searchParams.mountain!.toLowerCase()))
    : trips

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar user={session} />

      {/* Header */}
      <div className="pt-24 pb-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-summit-400 font-medium uppercase tracking-wider mb-2">
            {filteredTrips.length} expeditions available
          </p>
          <h1 className="font-display text-4xl text-stone-100">Mountain Expeditions</h1>
          <p className="text-stone-400 mt-2 text-base">
            Expert-guided trips to Pakistan's greatest peaks. All guides verified.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mr-2">
              <SlidersHorizontal size={13} />
              <span>Filter:</span>
            </div>
            {difficulties.map(d => (
              <a
                key={d}
                href={`/trips${d !== 'all' ? `?difficulty=${d}` : ''}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeDifficulty === d
                    ? 'bg-summit-600 text-white'
                    : 'bg-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-28">
            <Mountain size={48} className="text-stone-700 mx-auto mb-5" />
            <p className="text-stone-400 text-lg font-display">No expeditions found</p>
            <p className="text-stone-600 mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
