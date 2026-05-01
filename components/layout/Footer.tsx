import Link from 'next/link'
import { Mountain } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-stone-950 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-summit-600 rounded-md flex items-center justify-center">
                <Mountain size={14} className="text-white" />
              </div>
              <span className="font-display font-semibold text-stone-100">
                WeBook<span className="text-summit-400">Mountains</span>
              </span>
            </div>
            <p className="text-stone-500 text-sm max-w-xs leading-relaxed">
              Expert-guided mountain expeditions. Every guide is verified, licensed, and insured before leading any trip.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Platform</p>
            <div className="space-y-2">
              <Link href="/trips" className="block text-sm text-stone-500 hover:text-stone-300 transition-colors">Expeditions</Link>
              <Link href="/guides" className="block text-sm text-stone-500 hover:text-stone-300 transition-colors">Guides</Link>
              <Link href="/register" className="block text-sm text-stone-500 hover:text-stone-300 transition-colors">Become a guide</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Support</p>
            <div className="space-y-2">
              <Link href="/help" className="block text-sm text-stone-500 hover:text-stone-300 transition-colors">Help center</Link>
              <Link href="/safety" className="block text-sm text-stone-500 hover:text-stone-300 transition-colors">Safety standards</Link>
              <Link href="/cancellation" className="block text-sm text-stone-500 hover:text-stone-300 transition-colors">Cancellation policy</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-600">© 2025 WeBookMountains. All rights reserved.</p>
          <p className="text-xs text-stone-600">All guides verified · All trips insured · Safety first</p>
        </div>
      </div>
    </footer>
  )
}
