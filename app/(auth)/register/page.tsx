'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mountain, Eye, EyeOff, Users, Compass } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'customer'

  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer' | 'guide'>(defaultRole as 'customer' | 'guide')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          full_name: fullName.trim(),
          password,
          role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
      } else {
        router.push(role === 'guide' ? '/dashboard/guide' : '/dashboard/customer')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-alpine-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-summit-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-summit-600 rounded-xl flex items-center justify-center">
              <Mountain size={18} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-stone-100">
              WeBook<span className="text-summit-400">Mountains</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl text-stone-100">Create your account</h1>
          <p className="text-stone-500 text-sm mt-1">Join the mountain community</p>
        </div>

        <div className="bg-alpine-950/50 border border-white/8 rounded-2xl p-7">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { val: 'customer', icon: Users, label: 'Explorer', desc: 'Book trips' },
              { val: 'guide', icon: Compass, label: 'Guide', desc: 'Lead trips' },
            ].map(({ val, icon: Icon, label, desc }) => (
              <button
                key={val}
                type="button"
                onClick={() => setRole(val as 'customer' | 'guide')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  role === val
                    ? 'border-summit-600 bg-summit-900/30'
                    : 'border-white/8 hover:border-white/16 bg-stone-900/30'
                }`}
              >
                <Icon size={16} className={role === val ? 'text-summit-400' : 'text-stone-500'} />
                <p
                  className={`text-sm font-medium mt-2 ${
                    role === val ? 'text-stone-100' : 'text-stone-400'
                  }`}
                >
                  {label}
                </p>
                <p className="text-xs text-stone-600 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-stone-400 mb-1.5 font-medium">
                Full name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Hassan Khan"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5 font-medium">
                Username <span className="text-stone-600">(unique, lowercase)</span>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="hassan_k"
                value={username}
                onChange={e =>
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))
                }
                required
              />
            </div>

            <div>
              <label className="block text-xs text-stone-400 mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 mt-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="spinner" /> Creating account...
                </>
              ) : (
                `Create ${role} account`
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-summit-400 hover:text-summit-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
      <RegisterForm />
    </Suspense>
  )
}
