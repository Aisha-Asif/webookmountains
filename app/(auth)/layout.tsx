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
  const intercomAppId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID

  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-950 text-stone-100">
        {/*
          IntercomProvider is only rendered when the user is logged in.
          When the session disappears (logout), this component unmounts
          and calls Intercom('shutdown') in its useEffect cleanup.

          No Intercom widget is loaded for unauthenticated visitors.
        */}
        {session && intercomAppId && (
          <IntercomProvider user={session} appId={intercomAppId} />
        )}
        {children}
      </body>
    </html>
  )
}
