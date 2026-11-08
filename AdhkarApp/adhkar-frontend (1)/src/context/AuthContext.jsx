import { createContext, useCallback, useEffect, useState } from 'react'
import { tokenStorage } from '../api/api'
import { fetchProfile, loginUser, registerUser } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await fetchProfile()
      setUser(data)
      return data
    } catch {
      tokenStorage.clear()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (tokenStorage.getAccess()) {
        await loadProfile()
      }
      setIsAuthLoading(false)
    }
    init()
  }, [loadProfile])

  const login = useCallback(
    async ({ username, password }) => {
      const { data } = await loginUser({ username, password })
      tokenStorage.setTokens(data.access, data.refresh)
      await loadProfile()
    },
    [loadProfile]
  )

  const register = useCallback(async (payload) => {
    await registerUser(payload)
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isAuthLoading,
    login,
    register,
    logout,
    refreshProfile: loadProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
