'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Calendar, MessageSquare, Loader } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Trip, AuthUser } from '@/types'
import Link from 'next/link'

interface BookingFormProps {
  trip: Trip
  session: AuthUser | null
}

export default function BookingForm({ trip, session }: BookingFormProps) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [participants, setParticipants] = useState(1)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const total = trip.price_per_person * participants
  const deposit = Math.round(total * (trip.deposit_percent / 100))

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  async function handleBook() {
    setError('')
    if (!date) return setError('Please select a trip date')
    if (participants < 1 || participants > trip.max_participants) {
      return setError(`Participants must be 1–${trip.max_participants}`)
    }

    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: trip.id,
          trip_date: date,
          participants,
          special_requests: note || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Booking failed')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard/customer'), 2000)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-summit-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
          <div className="text-summit-400 text-2xl">✓</div>
        </div>
        <p className="font-display text-lg text-stone-100 mb-1">Booking submitted</p>
        <p className="text-sm text-stone-500">Redirecting to your dashboard...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-4">
        <p className="text-stone-400 text-sm mb-4">Sign in to book this expedition</p>
        <Link href={`/login?redirect=/trips/${trip.id}`} className="btn btn-primary w-full">
          Sign in to book
        </Link>
        <p className="text-xs text-stone-600 mt-3">
          Don't have an account?{' '}
          <Link href="/register" className="text-summit-400 hover:underline">Register free</Link>
        </p>
      </div>
    )
  }

  if (session.role === 'guide') {
    return (
      <p className="text-sm text-stone-500 text-center py-4">
        Guides cannot book trips. Switch to a customer account to book.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date */}
      <div>
        <label className="block text-xs text-stone-400 mb-1.5">
          <span className="flex items-center gap-1.5"><Calendar size={11} /> Trip date</span>
        </label>
        <input
          type="date"
          className="input-field"
          min={tomorrow}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Participants */}
      <div>
        <label className="block text-xs text-stone-400 mb-1.5">
          <span className="flex items-center gap-1.5"><Users size={11} /> Participants</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setParticipants(p => Math.max(1, p - 1))}
            className="w-9 h-9 bg-stone-800 rounded-lg text-stone-300 hover:bg-stone-700 transition-colors flex items-center justify-center text-lg"
          >
            −
          </button>
          <span className="flex-1 text-center font-medium text-stone-100">{participants}</span>
          <button
            onClick={() => setParticipants(p => Math.min(trip.max_participants, p + 1))}
            className="w-9 h-9 bg-stone-800 rounded-lg text-stone-300 hover:bg-stone-700 transition-colors flex items-center justify-center text-lg"
          >
            +
          </button>
        </div>
        <p className="text-xs text-stone-600 mt-1">Max {trip.max_participants} per group</p>
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs text-stone-400 mb-1.5">
          <span className="flex items-center gap-1.5"><MessageSquare size={11} /> Special requests (optional)</span>
        </label>
        <textarea
          className="input-field resize-none"
          rows={2}
          placeholder="Dietary needs, experience level, etc."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      {/* Price Summary */}
      <div className="bg-stone-900/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-stone-400">{formatCurrency(trip.price_per_person)} × {participants}</span>
          <span className="text-stone-200">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-400">Deposit due now ({trip.deposit_percent}%)</span>
          <span className="text-summit-400">{formatCurrency(deposit)}</span>
        </div>
        <hr className="border-white/5" />
        <div className="flex justify-between font-medium">
          <span className="text-stone-200">Total</span>
          <span className="text-stone-100">{formatCurrency(total)}</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleBook}
        disabled={loading}
        className="btn btn-primary w-full py-3.5 font-medium"
      >
        {loading ? (
          <><div className="spinner" /> Processing...</>
        ) : (
          `Request booking — ${formatCurrency(deposit)} deposit`
        )}
      </button>

      <p className="text-xs text-stone-600 text-center">
        No charge until the guide confirms. Full refund if cancelled within policy window.
      </p>
    </div>
  )
}
