'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Star, ChevronLeft } from 'lucide-react'

export default function ReviewPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return setError('Please select a rating')
    if (comment.trim().length < 10) return setError('Please write at least 10 characters')

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/bookings/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit review')
      } else {
        router.push('/dashboard/customer')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/dashboard/customer" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-100 mb-6">
          <ChevronLeft size={15} /> Back to dashboard
        </Link>

        <div className="bg-alpine-950/50 border border-white/8 rounded-2xl p-8">
          <h1 className="font-display text-2xl text-stone-100 mb-2">Leave a review</h1>
          <p className="text-stone-500 text-sm mb-6">Share your experience with the community</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-stone-400 mb-3">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={
                        n <= (hovered || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-700'
                      }
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-stone-500 mt-2">
                  {['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'][rating]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Your review</label>
              <textarea
                className="input-field resize-none"
                rows={5}
                placeholder="Describe your experience — the route, the guide, safety, what you'd tell others..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
              />
              <p className="text-xs text-stone-600 mt-1">{comment.length} / 500 characters</p>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || rating === 0}
              className="btn btn-primary w-full py-3 font-medium disabled:opacity-50"
            >
              {loading ? <><div className="spinner" /> Submitting...</> : 'Submit review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
