import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WeBookMountains — Summit Experiences',
  description: 'Book expert-guided mountain expeditions. Verified guides, guaranteed safety, unforgettable summits.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-950 text-stone-100">
        {children}
      </body>
    </html>
  )
}
