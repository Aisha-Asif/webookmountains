'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert']
const POLICIES = ['flexible', 'moderate', 'strict']

const MOUNTAINS = [
  'K2', 'Nanga Parbat', 'Broad Peak', 'Gasherbrum I', 'Gasherbrum II',
  'Rakaposhi', 'Tirich Mir', 'Masherbrum', 'Batura Sar', 'Spantik',
  'Haramosh', 'Diran', 'Passu Cones', 'Concordia', 'Other'
]

export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    mountain: '',
    difficulty: 'intermediate',
    duration_days: '',
    max_participants: '8',
    price_per_person: '',
    deposit_percent: '30',
    cancellation_policy: 'moderate',
    meeting_point: '',
    image_url: '',
  })

  const [includes, setIncludes] = useState<string[]>([''])
  const [requirements, setRequirements] = useState<string[]>([''])

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function addItem(list: string[], setList: (v: string[]) => void) {
    setList([...list, ''])
  }

  function updateItem(list: string[], setList: (v: string[]) => void, i: number, v: string) {
    const next = [...list]
    next[i] = v
    setList(next)
  }

  function removeItem(list: string[], setList: (v: string[]) => void, i: number) {
    setList(list.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.description || !form.mountain || !form.price_per_person || !form.duration_days) {
      return setError('Please fill in all required fields')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          includes: includes.filter(i => i.trim()),
          requirements: requirements.filter(r => r.trim()),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create trip')
      } else {
        router.push('/dashboard/guide')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <Link href="/dashboard/guide" className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-100 mb-6 transition-colors">
          <ChevronLeft size={15} /> Guide dashboard
        </Link>

        <h1 className="font-display text-3xl text-stone-100 mb-8">Create a new expedition</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
          <fieldset className="space-y-4">
            <legend className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-4 pb-2 border-b border-white/5 w-full">
              Basic information
            </legend>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Trip title *</label>
              <input className="input-field" placeholder="K2 Base Camp Trek" value={form.title} onChange={e => update('title', e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Mountain *</label>
              <select className="input-field" value={form.mountain} onChange={e => update('mountain', e.target.value)} required>
                <option value="">Select mountain</option>
                {MOUNTAINS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Description *</label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Describe the expedition in detail — route, scenery, experience required..."
                value={form.description}
                onChange={e => update('description', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">Difficulty *</label>
                <select className="input-field" value={form.difficulty} onChange={e => update('difficulty', e.target.value)}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">Duration (days) *</label>
                <input className="input-field" type="number" min="1" max="60" placeholder="7" value={form.duration_days} onChange={e => update('duration_days', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Meeting point</label>
              <input className="input-field" placeholder="Skardu Airport, Pakistan" value={form.meeting_point} onChange={e => update('meeting_point', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Cover image URL</label>
              <input className="input-field" type="url" placeholder="https://images.unsplash.com/..." value={form.image_url} onChange={e => update('image_url', e.target.value)} />
            </div>
          </fieldset>

          {/* Pricing */}
          <fieldset className="space-y-4">
            <legend className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-4 pb-2 border-b border-white/5 w-full">
              Pricing & capacity
            </legend>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">Price per person (USD) *</label>
                <input className="input-field" type="number" min="1" placeholder="1200" value={form.price_per_person} onChange={e => update('price_per_person', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">Max participants</label>
                <input className="input-field" type="number" min="1" max="20" value={form.max_participants} onChange={e => update('max_participants', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1.5">Deposit %</label>
                <input className="input-field" type="number" min="10" max="100" value={form.deposit_percent} onChange={e => update('deposit_percent', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5">Cancellation policy</label>
              <select className="input-field" value={form.cancellation_policy} onChange={e => update('cancellation_policy', e.target.value)}>
                <option value="flexible">Flexible — full refund up to 7 days before</option>
                <option value="moderate">Moderate — full refund up to 14 days, 50% up to 7 days</option>
                <option value="strict">Strict — non-refundable within 30 days</option>
              </select>
            </div>
          </fieldset>

          {/* Includes */}
          <fieldset>
            <legend className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-4 pb-2 border-b border-white/5 w-full">
              What's included
            </legend>
            <div className="space-y-2">
              {includes.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input-field"
                    placeholder="e.g. All camping gear"
                    value={item}
                    onChange={e => updateItem(includes, setIncludes, i, e.target.value)}
                  />
                  <button type="button" onClick={() => removeItem(includes, setIncludes, i)} className="p-2 text-stone-600 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addItem(includes, setIncludes)} className="flex items-center gap-1.5 text-xs text-summit-400 hover:text-summit-300 mt-1">
                <Plus size={13} /> Add item
              </button>
            </div>
          </fieldset>

          {/* Requirements */}
          <fieldset>
            <legend className="text-xs text-stone-400 uppercase tracking-wider font-medium mb-4 pb-2 border-b border-white/5 w-full">
              Requirements
            </legend>
            <div className="space-y-2">
              {requirements.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input-field"
                    placeholder="e.g. Good physical fitness"
                    value={item}
                    onChange={e => updateItem(requirements, setRequirements, i, e.target.value)}
                  />
                  <button type="button" onClick={() => removeItem(requirements, setRequirements, i)} className="p-2 text-stone-600 hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addItem(requirements, setRequirements)} className="flex items-center gap-1.5 text-xs text-summit-400 hover:text-summit-300 mt-1">
                <Plus size={13} /> Add requirement
              </button>
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/guide" className="btn btn-secondary flex-1 justify-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1 justify-center">
              {loading ? <><div className="spinner" /> Creating...</> : 'Create expedition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
