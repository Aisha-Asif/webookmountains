'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mountain, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import type { AuthUser } from '@/types'

interface NavbarProps {
  user?: AuthUser | null
}

export default function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-stone-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-summit-600 rounded-lg flex items-center justify-center group-hover:bg-summit-500 transition-colors">
              <Mountain size={16} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg text-stone-100">
              WeBook<span className="text-summit-400">Mountains</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/trips" className="text-sm text-stone-400 hover:text-stone-100 transition-colors">
              Expeditions
            </Link>
            <Link href="/guides" className="text-sm text-stone-400 hover:text-stone-100 transition-colors">
              Guides
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={user.role === 'guide' ? '/dashboard/guide' : '/dashboard/customer'}
                  className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-100 transition-colors"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-sm text-stone-400">
                  {user.full_name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-red-400 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm text-stone-400 hover:text-stone-100 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary text-sm px-4 py-2"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-white/5"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-2">
            <Link href="/trips" className="block px-3 py-2 text-sm text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5">
              Expeditions
            </Link>
            <Link href="/guides" className="block px-3 py-2 text-sm text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5">
              Guides
            </Link>
            {user ? (
              <>
                <Link href={user.role === 'guide' ? '/dashboard/guide' : '/dashboard/customer'} className="block px-3 py-2 text-sm text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/5">
                  Sign in
                </Link>
                <Link href="/register" className="block px-3 py-2 text-sm text-summit-400 font-medium">
                  Create account →
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
