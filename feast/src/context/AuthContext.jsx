import { createContext, useState, useCallback, useContext } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('feast_token'))
  const [user,  setUser]  = useState(() => {
    const u = localStorage.getItem('feast_user')
    return u ? JSON.parse(u) : null
  })

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('feast_token', newToken)
    localStorage.setItem('feast_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('feast_token')
    localStorage.removeItem('feast_user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => {
    const merged = { ...JSON.parse(localStorage.getItem('feast_user') || '{}'), ...updated }
    localStorage.setItem('feast_user', JSON.stringify(merged))
    setUser(merged)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
