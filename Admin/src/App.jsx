import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthProvider, AuthContext } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Billing from './pages/Billing'
import Users from './pages/Users'
import Offers from './pages/Offers'
import Analytics from './pages/Analytics'
import BugReports from './pages/BugReports'

function DeliveryGuard({ children }) {
  const { user } = useContext(AuthContext)
  // Delivery users who somehow land on /dashboard get pushed to /orders
  if (user?.role === 'delivery') return <Navigate to="/orders" replace />
  return children
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="page-enter">
            <Routes>
              {/* ── Admin + Developer ─────────────────────────── */}
              <Route path="dashboard" element={
                <DeliveryGuard><Dashboard /></DeliveryGuard>
              } />
              <Route path="products" element={
                <RoleRoute roles={['admin', 'developer']}><Products /></RoleRoute>
              } />
              <Route path="users" element={
                <RoleRoute roles={['admin', 'developer']}><Users /></RoleRoute>
              } />
              <Route path="offers" element={
                <RoleRoute roles={['admin', 'developer']}><Offers /></RoleRoute>
              } />

              {/* ── All roles ────────────────────────────────────*/}
              <Route path="orders"  element={<Orders />} />
              <Route path="billing" element={<Billing />} />

              {/* ── Developer only ───────────────────────────────*/}
              <Route path="analytics" element={
                <RoleRoute roles={['developer']}><Analytics /></RoleRoute>
              } />
              <Route path="bugs" element={
                <RoleRoute roles={['developer']}><BugReports /></RoleRoute>
              } />

              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AdminLayout />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
