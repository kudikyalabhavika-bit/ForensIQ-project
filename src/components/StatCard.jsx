import { TrendingUp, TrendingDown } from 'lucide-react'

const ICON_MAP = {
  'folder-open': '📁',
  save: '💾',
  database: '🗄️',
  'scan-face': '🔍',
}

function StatCard({ label, value, change, icon, trend }) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <div className="stat-card glass-panel fi-fade-in">
      <div className="stat-card-top">
        <div className="stat-card-icon">
          <span className="stat-card-emoji">{ICON_MAP[icon] || '📊'}</span>
        </div>
        <div className={`stat-card-trend ${trend}`}>
          <TrendIcon />
          <span>{change}</span>
        </div>
      </div>
      <div className="stat-card-value">{value.toLocaleString()}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}

export default StatCard
