import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import AccessDenied from './AccessDenied'

/**
 * Wraps a page and shows AccessDenied if the logged-in user's role
 * is not in the allowed `roles` array.
 * Usage: <RoleRoute roles={['developer']}><Analytics /></RoleRoute>
 */
export default function RoleRoute({ roles, children }) {
  const { user } = useContext(AuthContext)

  if (!user || !roles.includes(user.role)) {
    return <AccessDenied requiredRoles={roles} userRole={user?.role} />
  }

  return children
}
