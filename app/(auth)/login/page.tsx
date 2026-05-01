'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mountain, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
      } else {
        const role = data.user.role
        if (redirect !== '/') {
          router.push(redirect)
        } else {
          router.push(role === 'guide' ? '/dashboard/guide' : '/dashboard/customer')
        }
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-summit-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-alpine-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-9 h-9 bg-summit-600 rounded-xl flex items-center justify-center">
              <Mountain size={18} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-stone-100">
              WeBook<span className="text-summit-400">Mountains</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl text-stone-100">Welcome back</h1>
          <p className="text-stone-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="bg-alpine-950/50 border border-white/8 rounded-2xl p-7">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-stone-400 mb-1.5 font-medium">
                Username
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="your_username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                  <div className="spinner" /> Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-sm text-stone-500">
              No account?{' '}
              <Link
                href="/register"
                className="text-summit-400 hover:text-summit-300 transition-colors"
              >
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 bg-stone-900/40 border border-white/5 rounded-xl p-4">
          <p className="text-xs text-stone-500 font-medium mb-2">
            Demo accounts (seed data):
          </p>
          <div className="space-y-1 text-xs text-stone-600 font-mono">
            <p>
              customer:{' '}
              <span className="text-stone-400">alex_hiker</span> / pass:{' '}
              <span className="text-stone-400">password123</span>
            </p>
            <p>
              guide:{' '}
              <span className="text-stone-400">hassan_guide</span> / pass:{' '}
              <span className="text-stone-400">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
      <LoginForm />
    </Suspense>
  )
}
