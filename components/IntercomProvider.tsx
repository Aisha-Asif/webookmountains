'use client'
import { useEffect } from 'react'
import Intercom from '@intercom/messenger-js-sdk'
import type { AuthUser } from '@/types'

export default function IntercomProvider({ user }: { user?: AuthUser | null }) {
  useEffect(() => {
    Intercom({
      app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID!,
      ...(user && {
        user_id: user.id,
        name: user.full_name,
      }),
    })

    return () => {
      ;(Intercom as any)('shutdown')
    }
  }, [user?.id])

  return null
}