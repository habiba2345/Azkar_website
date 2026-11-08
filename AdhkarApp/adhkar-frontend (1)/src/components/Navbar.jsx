import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/categories', label: 'الأقسام' },
  { to: '/adhkar', label: 'الأذكار' },
  { to: '/quran', label: 'القرآن الكريم' },
  { to: '/rewards', label: 'الجوائز' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const close = () => setOpen(false)

  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={close}>
          🌙 أذكاري
        </NavLink>

        <button
          className="navbar-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="فتح القائمة"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${open ? 'is-open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={close}
            >
              {link.label}
            </NavLink>
          ))}

          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="navbar-user" onClick={close}>
                  👤 {user?.username}
                </NavLink>
                <NavLink to="/reminders" onClick={close}>
                  التذكيرات
                </NavLink>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-outline btn-sm" onClick={close}>
                  تسجيل الدخول
                </NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm" onClick={close}>
                  حساب جديد
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
