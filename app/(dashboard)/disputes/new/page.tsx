'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ChevronLeft } from 'lucide-react'

const ISSUE_TYPES = [
  { val: 'refund', label: 'Refund request', desc: 'Request a refund for your booking' },
  { val: 'guide_conduct', label: 'Guide conduct', desc: 'Issue with how the guide behaved' },
  { val: 'trip_quality', label: 'Trip quality', desc: 'Trip did not match description' },
  { val: 'safety', label: 'Safety concern', desc: 'Safety standards were not met' },
  { val: 'other', label: 'Other', desc: 'Something else happened' },
]

export default function DisputePage() {
  const router = useRouter()
  const [bookingId, setBookingId] = useState('')
  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingId || !issueType || !description) return setError('All fields are required')
    if (description.trim().length < 20) return setError('Please provide more detail (min 20 characters)')

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, issue_type: issueType, description }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit dispute')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-summit-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-summit-400" />
          </div>
          <h2 className="font-display text-2xl text-stone-100 mb-2">Dispute submitted</h2>
          <p className="text-stone-400 mb-2">
            Your dispute has been logged and will be reviewed by our support team within 4 business hours.
          </p>
          <p className="text-stone-500 text-sm mb-6">
            We will never commit to refund amounts, payout dates, or policy exceptions without a full review.
          </p>
          <Link href="/dashboard/customer" className="btn btn-primary">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <Link href="/dashboard/customer" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-100 mb-6">
          <ChevronLeft size={15} /> Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl text-stone-100">File a dispute</h1>
          <p className="text-stone-500 text-sm mt-1">
            Our support team reviews every dispute. Do not include sensitive payment information.
          </p>
        </div>

        {/* Important notice */}
        <div className="bg-amber-950/20 border border-amber-700/20 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Our team cannot approve refunds or exceptions through this form. All decisions are made by a human reviewer based on the platform's published policy.
          </p>
        </div>

        <div className="bg-alpine-950/50 border border-white/8 rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Booking ID *</label>
              <input
                className="input-field font-mono"
                placeholder="Paste your booking ID"
                value={bookingId}
                onChange={e => setBookingId(e.target.value.trim())}
                required
              />
              <p className="text-xs text-stone-600 mt-1">
                Find your booking ID in the dashboard under your trips
              </p>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-2">Issue type *</label>
              <div className="space-y-2">
                {ISSUE_TYPES.map(type => (
                  <button
                    key={type.val}
                    type="button"
                    onClick={() => setIssueType(type.val)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      issueType === type.val
                        ? 'border-summit-600 bg-summit-900/20'
                        : 'border-white/6 hover:border-white/12'
                    }`}
                  >
                    <p className={`text-sm font-medium ${issueType === type.val ? 'text-stone-100' : 'text-stone-400'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-stone-600 mt-0.5">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Describe the issue *</label>
              <textarea
                className="input-field resize-none"
                rows={5}
                placeholder="Provide clear details about what happened, when it occurred, and what outcome you're seeking. The more detail you provide, the faster we can help."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 font-medium"
            >
              {loading ? <><div className="spinner" /> Submitting...</> : 'Submit dispute'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
