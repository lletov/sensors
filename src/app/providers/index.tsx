import React, { useEffect } from 'react'
import { useSettingsStore, useAuthStore } from '@/app/store'
import { supabase } from '@/shared/lib/supabase'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme)
  const setUser = useAuthStore((s) => s.setUser)

  // Sync theme to <html> class
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Restore session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [setUser])

  return <>{children}</>
}
