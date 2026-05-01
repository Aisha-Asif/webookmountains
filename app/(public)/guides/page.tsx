import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Shield, Star, Mountain, Award, Users } from 'lucide-react'
import Link from 'next/link'

async function getGuides() {
  try {
    const db = createServiceClient()
    const { data } = await db
      .from('guides')
      .select(`
        id, bio, experience_years, specialties, certifications,
        is_verified, rating, total_reviews, total_trips,
        user:users(id, full_name, username)
      `)
      .order('rating', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

export default async function GuidesPage() {
  const [guides, session] = await Promise.all([getGuides(), getSession()])

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar user={session} />

      <div className="pt-24 pb-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-summit-400 font-medium uppercase tracking-wider mb-2">
            {guides.length} guides available
          </p>
          <h1 className="font-display text-4xl text-stone-100">Our mountain guides</h1>
          <p className="text-stone-400 mt-2">
            Every guide on WeBookMountains is verified for licensing, insurance, and identity before leading any trip.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {guides.length === 0 ? (
          <div className="text-center py-24">
            <Users size={48} className="text-stone-700 mx-auto mb-4" />
            <p className="text-stone-400">No guides registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide: any) => (
              <div key={guide.id} className="bg-alpine-950/40 border border-white/8 rounded-2xl p-6 card-hover">
                {/* Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-summit-700 to-alpine-700 flex items-center justify-center text-lg font-display text-stone-200 flex-shrink-0">
                      {guide.user?.full_name?.[0] || 'G'}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-100">{guide.user?.full_name}</p>
                      <p className="text-xs text-stone-500">@{guide.user?.username}</p>
                    </div>
                  </div>
                  {guide.is_verified && (
                    <span className="badge bg-summit-900/50 text-summit-300 border border-summit-700/30">
                      <Shield size={9} className="mr-1" /> Verified
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  {guide.rating > 0 && (
                    <span className="flex items-center gap-1 text-sm text-stone-400">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      {guide.rating}
                      <span className="text-stone-600">({guide.total_reviews})</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-stone-500">
                    <Mountain size={11} />
                    {guide.total_trips} trips
                  </span>
                  <span className="text-xs text-stone-500">
                    {guide.experience_years}yr exp
                  </span>
                </div>

                {/* Bio */}
                {guide.bio && (
                  <p className="text-sm text-stone-400 leading-relaxed line-clamp-3 mb-4">
                    {guide.bio}
                  </p>
                )}

                {/* Specialties */}
                {guide.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {guide.specialties.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-xs bg-stone-800 text-stone-400 px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {guide.certifications?.length > 0 && (
                  <div className="space-y-1 mb-5">
                    {guide.certifications.slice(0, 2).map((c: string) => (
                      <div key={c} className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Award size={10} className="text-amber-400" />
                        {c}
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/trips?guide_id=${guide.id}`}
                  className="btn btn-secondary w-full text-sm"
                >
                  View expeditions
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
