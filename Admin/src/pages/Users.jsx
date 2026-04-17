import { useState, useEffect, useContext } from 'react'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'

const ROLES = ['user', 'admin', 'delivery', 'developer']

const roleColors = {
  admin:     'bg-orange-50 text-orange-700 border-orange-200',
  user:      'bg-blue-50 text-blue-700 border-blue-200',
  delivery:  'bg-cyan-50 text-cyan-700 border-cyan-200',
  developer: 'bg-red-50 text-red-700 border-red-200',
}

const roleEmoji = {
  admin: '🟠', user: '👤', delivery: '🚚', developer: '🔴'
}

export default function Users() {
  const { user: me, hasRole } = useContext(AuthContext)
  const isDeveloper = hasRole('developer')

  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [search, setSearch]         = useState('')
  const [updatingRole, setUpdatingRole] = useState(null) // userId being updated

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users')
        setUsers(res.data.data || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change role to "${newRole}"?`)) return
    setUpdatingRole(userId)
    try {
      await api.put(`/users/${userId}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.')
    } finally {
      setUpdatingRole(null)
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )

  // Stats by role
  const countByRole = role => users.filter(u => u.role === role).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Users</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            All registered users on Feast At Night
            {isDeveloper && <span className="ml-2 inline-flex items-center gap-1 text-red-500 text-xs font-semibold">🔴 Role management enabled</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm w-full sm:w-72">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 w-full outline-none"
          />
        </div>
      </div>

      {/* Stats strip */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Customers',  value: countByRole('user'),      color: 'from-blue-400 to-blue-600' },
            { label: 'Admins',     value: countByRole('admin'),     color: 'from-orange-400 to-orange-600' },
            { label: 'Delivery',   value: countByRole('delivery'),  color: 'from-cyan-400 to-cyan-600' },
            { label: 'Developers', value: countByRole('developer'), color: 'from-red-500 to-rose-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
              <p className="text-white/75 text-xs font-medium mb-1">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading users...</p>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-sm">{error}</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">All Users</h3>
            <span className="text-xs text-slate-400">{filtered.length} of {users.length} users</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="font-medium">No users found</p>
              {search && <p className="text-sm mt-1">Try a different search term</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-semibold">User</th>
                    <th className="text-left px-6 py-3 font-semibold">Email</th>
                    <th className="text-left px-6 py-3 font-semibold">Phone</th>
                    <th className="text-left px-6 py-3 font-semibold">Address</th>
                    <th className="text-left px-6 py-3 font-semibold">Role</th>
                    <th className="text-left px-6 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      {/* Avatar + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            <p className="text-slate-400 text-xs">ID #{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{u.email}</td>
                      <td className="px-6 py-4 text-slate-600">{u.phone || <span className="text-slate-300">—</span>}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-[180px]">
                        {u.address
                          ? <span className="line-clamp-1 text-xs">{u.address}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>

                      {/* Role — dropdown for developer, badge for others */}
                      <td className="px-6 py-4">
                        {isDeveloper && u.id !== me?.id ? (
                          <div className="relative">
                            {updatingRole === u.id ? (
                              <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                Updating...
                              </div>
                            ) : (
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                className={`text-xs font-semibold border rounded-full px-3 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-300 transition-all ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}
                              >
                                {ROLES.map(r => (
                                  <option key={r} value={r}>{roleEmoji[r]} {r}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                            {roleEmoji[u.role]} {u.role}
                            {u.id === me?.id && <span className="opacity-60">(you)</span>}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
