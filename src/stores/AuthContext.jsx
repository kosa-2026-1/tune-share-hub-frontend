import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, logout as logoutRequest, reissue } from '../api/authApi.js'
import { clearAccessToken, setAccessToken } from './tokenStore.js'

const AuthContext = createContext(null)
const USER_STORAGE_KEY = 'tsh:user'

function readStoredUser() {
  try {
    const rawUser = window.sessionStorage.getItem(USER_STORAGE_KEY)
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

function storeUser(user) {
  if (user) {
    window.sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    window.sessionStorage.removeItem(USER_STORAGE_KEY)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    let mounted = true

    async function restoreAccessToken() {
      if (!user) {
        setBootstrapping(false)
        return
      }

      try {
        const result = await reissue()
        if (result.accessToken) {
          setAccessToken(result.accessToken)
        }
      } catch {
        clearAccessToken()
      } finally {
        if (mounted) {
          setBootstrapping(false)
        }
      }
    }

    restoreAccessToken()

    return () => {
      mounted = false
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      userId: user?.userId,
      bootstrapping,
      async login(credentials) {
        const result = await loginRequest(credentials)
        if (!result.accessToken) {
          throw new Error('로그인 응답에 Access Token이 없습니다.')
        }
        setAccessToken(result.accessToken)
        setUser(result.user)
        storeUser(result.user)
        return result.user
      },
      async logout() {
        try {
          if (user?.userId) {
            await logoutRequest()
          }
        } finally {
          clearAccessToken()
          setUser(null)
          storeUser(null)
        }
      },
    }),
    [bootstrapping, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
