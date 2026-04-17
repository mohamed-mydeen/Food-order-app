import { createContext, useState, useCallback } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('feast_admin_token'))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('feast_admin_user')
    return u ? JSON.parse(u) : null
  })

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('feast_admin_token', newToken)
    localStorage.setItem('feast_admin_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('feast_admin_token')
    localStorage.removeItem('feast_admin_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, hasRole: (...roles) => roles.includes(user?.role) }}>
      {children}
    </AuthContext.Provider>
  )
}
