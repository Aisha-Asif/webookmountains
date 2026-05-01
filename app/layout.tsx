import type { Metadata } from 'next'
import './globals.css'
import IntercomProvider from '@/components/IntercomProvider'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'WeBookMountains — Summit Experiences',
  description: 'Book expert-guided mountain expeditions.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-950 text-stone-100">
        <IntercomProvider user={session} />
        {children}
      </body>
    </html>
  )
}