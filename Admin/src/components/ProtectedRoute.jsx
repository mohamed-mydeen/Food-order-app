import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const ALLOWED_ROLES = ['admin', 'delivery', 'developer']

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useContext(AuthContext)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Block regular users from accessing admin panel
  if (user && !ALLOWED_ROLES.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
