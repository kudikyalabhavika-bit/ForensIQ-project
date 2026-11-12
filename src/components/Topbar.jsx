import { useNavigate } from 'react-router-dom'
import { Menu, Fingerprint, Bell, Search, LogOut } from 'lucide-react'
import { logout, getUsername, getRole } from '../services/dbApi'

function Topbar({ onMenuClick }) {
  const navigate = useNavigate()
  const username = getUsername() || 'User'
  const initials = username.slice(0, 2).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu />
      </button>

      <div className="topbar-brand">
        <Fingerprint />
        <span>ForensIQ</span>
      </div>

      <div className="topbar-search">
        <Search />
        <input type="text" placeholder="Search cases, suspects, records..." />
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell />
          <span className="topbar-badge" />
        </button>
        <button
          className="topbar-icon-btn"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut />
        </button>
        <div className="topbar-avatar" title={`${username} (${getRole() || 'no role'})`}>
          {initials}
        </div>
      </div>
    </header>
  )
}

export default Topbar
