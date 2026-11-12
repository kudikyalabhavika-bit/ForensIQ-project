import { useState } from 'react'
import {
  Smile,
  Scissors,
  Eye,
  EyeOff,
  ChevronRight,
  Circle,
  Spline,
  Ear,
  User,
  Sparkles,
  Search,
} from 'lucide-react'

// Category metadata: display name + lucide icon
const CATEGORY_META = {
  face:      { label: 'Face',       icon: Smile },
  hair:      { label: 'Hair',       icon: Scissors },
  eyes:      { label: 'Eyes',       icon: Eye },
  eyebrows:  { label: 'Eyebrows',   icon: EyeOff },
  nose:      { label: 'Nose',       icon: Spline },
  mouth:     { label: 'Mouth / Lips', icon: Smile },
  ears:      { label: 'Ears',       icon: Ear },
  beard:     { label: 'Beard',      icon: User },
  mustache:  { label: 'Mustache',   icon: Sparkles },
  other:     { label: 'Other',      icon: Circle },
}

const CATEGORY_ORDER = ['face', 'hair', 'eyes', 'eyebrows', 'nose', 'mouth', 'ears', 'beard', 'mustache', 'other']

function FeatureSidebar({ features, loading, backendOnline, onAddFeature }) {
  const [expanded, setExpanded] = useState({ face: true, hair: true })
  const [search, setSearch] = useState('')

  function toggleCategory(cat) {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  // Filter features by search
  const filtered = {}
  for (const cat of CATEGORY_ORDER) {
    const items = features[cat] || []
    if (search.trim()) {
      filtered[cat] = items.filter((f) =>
        f.filename.toLowerCase().includes(search.toLowerCase())
      )
    } else {
      filtered[cat] = items
    }
  }

  return (
    <aside className="feature-sidebar">
      <div className="sidebar-header">
        <h3>Features</h3>
        <span className={`sidebar-status ${backendOnline ? 'online' : 'offline'}`}>
          {backendOnline ? 'Live' : 'Demo'}
        </span>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search features..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="category-list">
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <span className="fi-spinner" />
          </div>
        )}

        {!loading && CATEGORY_ORDER.map((cat) => {
          const items = filtered[cat] || []
          const meta = CATEGORY_META[cat]
          const Icon = meta.icon
          const isOpen = expanded[cat]

          // Hide categories with no items when searching
          if (search.trim() && items.length === 0) return null

          return (
            <div key={cat} className="category-item">
              <div
                className="category-header"
                onClick={() => toggleCategory(cat)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') toggleCategory(cat) }}
              >
                <span className="category-label">
                  <Icon />
                  {meta.label}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="category-count">{items.length}</span>
                  <span className={`category-chevron ${isOpen ? 'open' : ''}`}>
                    <ChevronRight />
                  </span>
                </span>
              </div>

              {isOpen && items.length > 0 && (
                <div className="category-content">
                  {items.map((item) => (
                    <div
                      key={item.filename}
                      className="feature-thumb"
                      onClick={() => onAddFeature(cat, item)}
                      title={`Add ${item.filename}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('featureType', cat)
                        e.dataTransfer.setData('featureFilename', item.filename)
                        e.dataTransfer.setData('featureUrl', item.url)
                      }}
                    >
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.filename}
                          loading="lazy"
                        />
                      ) : (
                        <div className="feature-thumb-loading">
                          <span className="fi-spinner" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isOpen && items.length === 0 && !search.trim() && (
                <div style={{ padding: '8px 16px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  No assets available
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

export default FeatureSidebar
