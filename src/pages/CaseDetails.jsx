import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FolderOpen, User, Save, Plus, Trash2, Eye } from 'lucide-react'
import {
  getCase,
  updateCase,
  linkProfile,
  unlinkProfile,
  listProfiles,
  getRole,
} from '../services/dbApi'
import '../styles/criminalProfile.css'

const STATUS_CLASS = { open: 'status-investigating', closed: 'status-closed' }
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—')
const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleDateString()
}

function CaseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = getRole()
  const canEdit = role === 'admin' || role === 'investigator'

  const [kase, setKase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ category: '', department: '', status: 'open' })
  const [allProfiles, setAllProfiles] = useState([])
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const c = await getCase(id)
      setKase(c)
      setForm({
        category: c.category || '',
        department: c.department || '',
        status: c.status || 'open',
      })
      if (canEdit) {
        const data = await listProfiles({ per_page: 100 })
        setAllProfiles(data.items)
      }
    } catch (err) {
      setKase(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, canEdit])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  async function handleSave() {
    setSaving(true)
    setMsg('')
    try {
      await updateCase(kase.case_code, form)
      setMsg('Case updated.')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleLink() {
    if (!selected) return
    try {
      await linkProfile(kase.case_code, selected)
      setSelected('')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUnlink(code) {
    try {
      await unlinkProfile(kase.case_code, code)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading && !kase) {
    return (
      <div className="placeholder-page fi-fade-in">
        <div className="placeholder-card glass-panel">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  if (!kase) {
    return (
      <div className="placeholder-page fi-fade-in">
        <div className="placeholder-card glass-panel">
          <div className="placeholder-icon">
            <FolderOpen />
          </div>
          <h1>Case Not Found</h1>
          <p>
            No case found for ID <strong>{id}</strong>.
          </p>
          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
          <button className="placeholder-back-btn" onClick={() => navigate('/criminal-database')}>
            <ArrowLeft />
            Back to Database
          </button>
        </div>
      </div>
    )
  }

  const linked = kase.profiles || []
  const candidates = allProfiles.filter((p) => !linked.some((l) => l.id === p.id))

  const infoRows = [
    { label: 'Case ID', value: kase.case_code },
    { label: 'Reference No.', value: kase.reference_no || '—' },
    { label: 'Category', value: kase.category || '—' },
    { label: 'Status', value: cap(kase.status) },
    { label: 'Department', value: kase.department || '—' },
    { label: 'Created', value: fmtDate(kase.created_at) },
    { label: 'Linked Profiles', value: linked.length },
  ]

  return (
    <div className="criminal-profile-page">
      <div className="profile-header fi-fade-in">
        <div className="profile-header-left">
          <button className="profile-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Back
          </button>
          <div className="profile-avatar">
            <FolderOpen />
          </div>
          <div className="profile-header-info">
            <h1>{kase.category}</h1>
            <span className="profile-id">{kase.case_code}</span>
            <span className={`case-status ${STATUS_CLASS[kase.status] || ''}`}>{cap(kase.status)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: 16, color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-left-col">
          <div className="profile-info-card glass-panel fi-fade-in">
            <h2 className="card-title">Case Information</h2>
            <div className="profile-info-grid">
              {infoRows.map((r) => (
                <div key={r.label} className="profile-info-row">
                  <span className="profile-info-label">{r.label}</span>
                  <span className="profile-info-value">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {canEdit && (
            <div className="profile-notes-card glass-panel fi-fade-in">
              <h2 className="card-title">Edit Case</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  className="db-select"
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <input
                  className="db-select"
                  placeholder="Department"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
                <select
                  className="db-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="notes-actions">
                {msg && <span className="notes-saved">{msg}</span>}
                <button className="page-btn primary" onClick={handleSave} disabled={saving}>
                  <Save />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-right-col">
          <div className="profile-evidence-card glass-panel fi-fade-in">
            <h2 className="card-title">Linked Profiles</h2>

            {linked.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No profiles are linked to this case yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
                {linked.map((p) => (
                  <div
                    key={p.id}
                    className="profile-info-row"
                    style={{ alignItems: 'center', gap: 8 }}
                  >
                    <span className="profile-info-value" style={{ flex: 1 }}>
                      <User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      {p.profile_code} · {p.name}
                    </span>
                    <button
                      className="page-btn small"
                      onClick={() => navigate(`/criminal-profile/${p.profile_code}`)}
                    >
                      <Eye />
                      View
                    </button>
                    {canEdit && (
                      <button className="page-btn small" onClick={() => handleUnlink(p.profile_code)}>
                        <Trash2 />
                        Unlink
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {canEdit && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="db-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
                  <option value="">Link a profile...</option>
                  {candidates.map((p) => (
                    <option key={p.id} value={p.profile_code}>
                      {p.profile_code} · {p.name}
                    </option>
                  ))}
                </select>
                <button className="page-btn primary" onClick={handleLink} disabled={!selected}>
                  <Plus />
                  Link Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-actions" style={{ marginTop: 16 }}>
        <button className="page-btn" onClick={() => navigate('/criminal-database')}>
          Back to Database
        </button>
      </div>
    </div>
  )
}

export default CaseDetails
