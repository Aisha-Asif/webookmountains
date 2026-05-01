'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Star } from 'lucide-react'

export default function BookingActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function updateStatus(status: string) {
    setLoading(status)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Update failed')
      } else {
        router.push('/dashboard/guide')
        router.refresh()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(null)
    }
  }

  if (currentStatus === 'pending') {
    return (
      <div className="space-y-3">
        <p className="text-xs text-stone-500">Review this booking request and confirm or decline.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={!!loading}
            className="btn btn-danger flex-1"
          >
            <XCircle size={15} />
            {loading === 'cancelled' ? 'Declining...' : 'Decline'}
          </button>
          <button
            onClick={() => updateStatus('confirmed')}
            disabled={!!loading}
            className="btn btn-primary flex-1"
          >
            <CheckCircle size={15} />
            {loading === 'confirmed' ? 'Confirming...' : 'Confirm booking'}
          </button>
        </div>
      </div>
    )
  }

  if (currentStatus === 'confirmed') {
    return (
      <div className="space-y-3">
        <p className="text-xs text-stone-500">This booking is confirmed. Mark as completed after the trip.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={() => updateStatus('completed')}
          disabled={!!loading}
          className="btn btn-primary w-full"
        >
          <Star size={15} />
          {loading === 'completed' ? 'Marking...' : 'Mark trip as completed'}
        </button>
      </div>
    )
  }

  return (
    <p className="text-sm text-stone-500">
      This booking is <span className="text-stone-300 font-medium">{currentStatus}</span>. No further actions available.
    </p>
  )
}
