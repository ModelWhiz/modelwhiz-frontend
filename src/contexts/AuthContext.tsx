'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Session, User } from '@supabase/supabase-js'

type AuthInfo = {
  session: Session | null
  user: User | null
  user_id: string | null
}

const AuthContext = createContext<AuthInfo>({
  session: null,
  user: null,
  user_id: null,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    session: null,
    user: null,
    user_id: null,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session ?? null
      const user = session?.user ?? null
      setAuthInfo({
        session,
        user,
        user_id: user?.id ?? null,
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setAuthInfo({
        session,
        user,
        user_id: user?.id ?? null,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
