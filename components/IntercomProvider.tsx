'use client'
import { useEffect } from 'react'
import type { AuthUser } from '@/types'

declare global {
  interface Window {
    Intercom: (...args: any[]) => void
    intercomSettings: Record<string, any>
  }
}

interface IntercomProviderProps {
  user: AuthUser
  appId: string
}

/**
 * Mounts the Intercom Messenger widget for authenticated users only.
 * Boots Intercom on mount (or when user changes), and shuts it down
 * when this component unmounts — which only happens on logout since
 * layout.tsx only renders this when a session exists.
 */
export default function IntercomProvider({ user, appId }: IntercomProviderProps) {
  useEffect(() => {
    if (!appId || !user?.id) return

    // Inject the Intercom loader script once
    if (!document.getElementById('intercom-script')) {
      const script = document.createElement('script')
      script.id = 'intercom-script'
      script.async = true
      script.src = `https://widget.intercom.io/widget/${appId}`
      document.body.appendChild(script)

      script.onload = () => bootIntercom()
    } else {
      bootIntercom()
    }

    function bootIntercom() {
      if (typeof window.Intercom !== 'function') return
      window.Intercom('boot', {
        app_id: appId,
        user_id: user.id,
        name: user.full_name,
        // Intercom Fin (AI agent) is configured in the Intercom dashboard —
        // no extra SDK calls needed. Enabling it there makes it available
        // in the same messenger widget automatically.
      })
    }

    return () => {
      // Shutdown cleanly when the user logs out (layout stops rendering this)
      if (typeof window.Intercom === 'function') {
        window.Intercom('shutdown')
      }
    }
  }, [user.id, appId])

  return null
}
