import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import Contact from './pages/Contact'
import Settings from './pages/Settings'
import InstallBanner from './components/InstallBanner'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/"        element={<Splash />} />
          <Route path="/home"    element={<Home />} />
          <Route path="/menu"    element={<Menu />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/signup"  element={<SignUp />} />
          <Route path="/cart"    element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders"  element={<Orders />} />
          <Route path="/contact"  element={<Contact />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global floating PWA install prompt */}
        <InstallBanner />
      </div>
    </BrowserRouter>
  )
}
