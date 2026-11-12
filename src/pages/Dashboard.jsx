import { useNavigate } from 'react-router-dom'
import {
  PenTool,
  Database,
  FolderOpen,
  ScanFace,
  ArrowRight,
  Activity,
  PenTool as PenIcon,
  FolderPlus,
  Database as DbIcon,
  ScanFace as ScanIcon,
  FilePlus,
  Zap,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import { stats, recentCases, activityTimeline } from '../data/mockData'
import '../styles/dashboard.css'

const FEATURE_ICONS = {
  sketch: PenTool,
  database: Database,
  cases: FolderOpen,
  analysis: ScanFace,
}

const ACTIVITY_ICONS = {
  'pen-tool': PenIcon,
  'folder-plus': FolderPlus,
  database: DbIcon,
  'scan-face': ScanIcon,
  'file-plus': FilePlus,
}

const STATUS_COLORS = {
  'Active': 'status-active',
  'Under Investigation': 'status-investigating',
  'Pending': 'status-pending',
  'Closed': 'status-closed',
}

function Dashboard() {
  const navigate = useNavigate()

  const featureCards = [
    {
      id: 'sketch',
      title: 'Sketch Generation',
      desc: 'Create a forensic suspect sketch using facial features.',
      btn: 'Open Sketch Generator',
      path: '/sketch-generation',
    },
    {
      id: 'database',
      title: 'Criminal Database',
      desc: 'Search and manage investigation records.',
      btn: 'Open Database',
      path: '/criminal-database',
    },
    {
      id: 'cases',
      title: 'Saved Cases',
      desc: 'Access previously saved investigation cases.',
      btn: 'View Cases',
      path: '/saved-cases',
    },
    {
      id: 'analysis',
      title: 'AI Match & Analysis',
      desc: 'Compare generated sketches with database records.',
      btn: 'Run AI Analysis',
      path: '/ai-analysis',
    },
  ]

  const quickActions = [
    { label: 'Create Sketch', path: '/sketch-generation', icon: PenTool },
    { label: 'Search Database', path: '/criminal-database', icon: Database },
    { label: 'Open Saved Cases', path: '/saved-cases', icon: FolderOpen },
    { label: 'Run AI Analysis', path: '/ai-analysis', icon: ScanFace },
  ]

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-header fi-fade-in">
        <div className="dash-header-text">
          <h1>Welcome back, Investigator</h1>
          <p>Monitor investigations, generate forensic sketches and analyze potential matches.</p>
        </div>
        <div className="dash-status">
          <span className="dash-status-dot" />
          <span className="dash-status-text">SYSTEM OPERATIONAL</span>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard key={s.id} label={s.label} value={s.value} change={s.change} icon={s.icon} trend={s.trend} />
        ))}
      </div>

      {/* Feature cards */}
      <div className="feature-grid">
        {featureCards.map((card) => {
          const Icon = FEATURE_ICONS[card.id]
          return (
            <div key={card.id} className="feature-card glass-panel fi-fade-in">
              <div className="feature-card-icon">
                <Icon />
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <button className="feature-card-btn" onClick={() => navigate(card.path)}>
                {card.btn}
                <ArrowRight />
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom section: recent cases + sidebar */}
      <div className="dash-bottom">
        {/* Recent cases */}
        <div className="dash-recent-cases glass-panel fi-fade-in">
          <div className="section-header">
            <h2>Recent Cases</h2>
            <span className="section-count">{recentCases.length} cases</span>
          </div>
          <div className="cases-table-wrap">
            <table className="cases-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Case Name</th>
                  <th>Suspect</th>
                  <th>Investigator</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c.id}>
                    <td className="case-id">{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.suspect}</td>
                    <td>{c.investigator}</td>
                    <td>
                      <span className={`case-status ${STATUS_COLORS[c.status] || ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="case-time">{c.lastUpdated}</td>
                    <td>
                      <button className="case-view-btn" onClick={() => navigate(`/case-details/${c.id}`)}>
                        View
                      </button>
                      <button className="case-view-btn" style={{ marginLeft: '6px' }} onClick={() => navigate(`/criminal-profile/CRIM-00${(recentCases.indexOf(c) + 1).toString().padStart(2, '0')}`)}>
                        Criminal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: quick actions + activity */}
        <div className="dash-right-col">
          {/* Quick actions */}
          <div className="dash-quick-actions glass-panel fi-fade-in">
            <div className="section-header">
              <h2><Zap /> Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((qa) => {
                const Icon = qa.icon
                return (
                  <button
                    key={qa.label}
                    className="quick-action-btn"
                    onClick={() => navigate(qa.path)}
                  >
                    <Icon />
                    <span>{qa.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Activity timeline */}
          <div className="dash-activity glass-panel fi-fade-in">
            <div className="section-header">
              <h2><Activity /> Case Activity</h2>
            </div>
            <div className="activity-timeline">
              {activityTimeline.map((item) => {
                const Icon = ACTIVITY_ICONS[item.icon] || Activity
                return (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon">
                      <Icon />
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">{item.text}</span>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
