import Link from 'next/link'
import { Mountain, Shield, Star, Users, ArrowRight, ChevronDown, Wind, Compass, Award } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import TripCard from '@/components/booking/TripCard'
import type { Trip } from '@/types'

async function getFeaturedTrips(): Promise<Trip[]> {
  try {
    const db = createServiceClient()
    const { data } = await db
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
      .limit(6)
    return data || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [trips, session] = await Promise.all([getFeaturedTrips(), getSession()])

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar user={session} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/50 to-stone-950" />
        <div className="absolute inset-0 mountain-texture" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-summit-900/40 border border-summit-700/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
              <Shield size={12} className="text-summit-400" />
              <span className="text-xs text-summit-300 font-medium tracking-wide">All guides verified & insured</span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl text-stone-50 mb-6 leading-[1.05]">
              Reach the{' '}
              <span className="gradient-text italic">summit</span>
              <br />
              with an expert.
            </h1>

            <p className="text-lg text-stone-300 mb-10 max-w-xl leading-relaxed">
              Book expert-guided mountain expeditions in Pakistan and beyond. Every guide is verified for licensing, insurance, and identity before leading any trip.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/trips" className="btn btn-primary px-7 py-3.5 text-base font-medium">
                Browse expeditions
                <ArrowRight size={16} />
              </Link>
              <Link href="/guides" className="btn btn-secondary px-7 py-3.5 text-base">
                Meet our guides
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14">
              {[
                { val: '40+', label: 'Verified guides' },
                { val: '120+', label: 'Completed expeditions' },
                { val: '4.9', label: 'Average rating' },
                { val: '100%', label: 'Safety record' },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-display text-2xl text-stone-100 font-semibold">{s.val}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <p className="text-xs text-stone-400 tracking-widest uppercase">Scroll</p>
          <ChevronDown size={16} className="text-stone-400 animate-bounce" />
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-white/5 bg-stone-900/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Identity Verified', desc: 'Every guide confirmed in person' },
              { icon: Award, title: 'Licensed & Insured', desc: 'Full liability coverage on all trips' },
              { icon: Compass, title: 'Real-Time Support', desc: 'Human backup 24/7 during trips' },
              { icon: Wind, title: 'Weather Monitored', desc: 'Live conditions checked pre-departure' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-summit-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-summit-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-200">{title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-summit-400 font-medium uppercase tracking-wider mb-2">Featured expeditions</p>
            <h2 className="font-display text-4xl text-stone-100">Choose your summit</h2>
          </div>
          <Link href="/trips" className="hidden sm:flex items-center gap-2 text-sm text-stone-400 hover:text-stone-100 transition-colors">
            View all
            <ArrowRight size={14} />
          </Link>
        </div>

        {trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-white/5 rounded-2xl">
            <Mountain size={40} className="text-stone-700 mx-auto mb-4" />
            <p className="text-stone-500">No expeditions listed yet. Check back soon.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-alpine-900/80 to-summit-900/60 border border-white/8 p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,141,100,0.15)_0%,_transparent_70%)]" />
          <div className="relative">
            <Mountain size={36} className="text-summit-400 mx-auto mb-5" />
            <h2 className="font-display text-4xl text-stone-100 mb-4">Ready to guide?</h2>
            <p className="text-stone-400 mb-8 max-w-md mx-auto text-base leading-relaxed">
              Join our platform as a verified guide. Set your own trips, manage bookings, and grow your mountaineering business.
            </p>
            <Link href="/register?role=guide" className="btn btn-primary px-8 py-3.5 text-base">
              Apply as a guide
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
