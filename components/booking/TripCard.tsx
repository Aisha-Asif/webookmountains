import Link from 'next/link'
import { MapPin, Clock, Users, Star, Shield } from 'lucide-react'
import type { Trip } from '@/types'
import { formatCurrency, difficultyColor, cn } from '@/lib/utils'

interface TripCardProps {
  trip: Trip
}

const MOUNTAIN_IMAGES: Record<string, string> = {
  'K2': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  'Nanga Parbat': 'https://images.unsplash.com/photo-1606210428862-0b9d4e8a9d32?w=600&q=80',
  'Broad Peak': 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80',
  'Rakaposhi': 'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=600&q=80',
  'Tirich Mir': 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80',
  'Gasherbrum I': 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
}

export default function TripCard({ trip }: TripCardProps) {
  const img = MOUNTAIN_IMAGES[trip.mountain] || MOUNTAIN_IMAGES['default']

  return (
    <Link href={`/trips/${trip.id}`}>
      <article className="bg-alpine-950/50 border border-white/8 rounded-2xl overflow-hidden card-hover group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={trip.image_url || img}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={cn('badge text-xs', difficultyColor(trip.difficulty))}>
              {trip.difficulty}
            </span>
          </div>
          {trip.guide?.is_verified && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-summit-900/80 text-summit-300 border border-summit-700/40 backdrop-blur-sm">
                <Shield size={10} className="mr-1" />
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-stone-100 text-lg leading-snug group-hover:text-summit-300 transition-colors line-clamp-2">
              {trip.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-3">
            <MapPin size={11} />
            <span>{trip.mountain}</span>
          </div>

          <p className="text-stone-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {trip.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {trip.duration_days}d
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              Max {trip.max_participants}
            </span>
            {trip.guide?.rating && trip.guide.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star size={11} fill="currentColor" />
                {trip.guide.rating.toFixed(1)}
                <span className="text-stone-500">({trip.guide.total_reviews})</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <p className="text-xs text-stone-500 mb-0.5">from</p>
              <p className="font-display font-semibold text-stone-100 text-xl">
                {formatCurrency(trip.price_per_person)}
                <span className="text-sm font-normal text-stone-500 ml-1">/ person</span>
              </p>
            </div>
            {trip.guide && (
              <div className="text-right">
                <p className="text-xs text-stone-500">Guide</p>
                <p className="text-sm text-stone-300">{trip.guide.user?.full_name || 'Expert Guide'}</p>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
