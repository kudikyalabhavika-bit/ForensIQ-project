
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PenTool,
  Database,
  FolderOpen,
  ScanFace,
  Settings,
  Fingerprint,
  LogOut,
  X,
  BrainCircuit,
} from 'lucide-react'
import { sidebarItems } from '../data/mockData'

const ICON_MAP = {
  'layout-dashboard': LayoutDashboard,
  'pen-tool': PenTool,
  database: Database,
  'folder-open': FolderOpen,
  'scan-face': ScanFace,
  settings: Settings,
}

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  function handleNavigate(path) {
    navigate(path)
    onClose()
  }

  function handleLogout() {
    navigate('/login')
  }

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Fingerprint />
        </div>
        <span className="sidebar-brand-text">ForensIQ</span>
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <X />
        </button>
      </div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <Icon />
              <span>{item.label}</span>
              {isActive && <span className="sidebar-item-bar" />}
            </button>
          )
        })}

        <button
          className={`sidebar-item ${location.pathname === '/nlp-identification' ? 'active' : ''}`}
          onClick={() => handleNavigate('/nlp-identification')}
        >
          <BrainCircuit />
          <span>NLP Suspect Identification</span>
          {location.pathname === '/nlp-identification' && (
            <span className="sidebar-item-bar" />
          )}
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-investigator">
          <div className="sidebar-investigator-avatar">IP</div>
          <div className="sidebar-investigator-info">
            <span className="sidebar-investigator-name">Investigator</span>
            <span className="sidebar-investigator-role">Field Officer</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
