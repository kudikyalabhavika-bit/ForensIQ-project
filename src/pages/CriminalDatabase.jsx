import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Eye,
  FolderOpen,
  Pencil,
  Archive,
  Plus,
  Database,
  Users,
  ShieldCheck,
  FileX,
  X,
} from 'lucide-react'
import Modal from '../components/Modal'
import {
  listProfiles,
  createProfile,
  updateProfile,
  archiveProfile,
  getRole,
} from '../services/dbApi'
import '../styles/criminalDatabase.css'

// Dropdown options (same values the seed script uses)
const FACE_SHAPES = ['oval', 'round', 'square', 'heart', 'long']
const HAIR_COLOURS = ['black', 'brown', 'grey', 'blonde']
const FEATURE_OPTIONS = {
  face_shape: FACE_SHAPES,
  eye_shape: ['round', 'almond', 'narrow', 'hooded'],
  eye_colour: ['brown', 'black', 'hazel', 'green'],
  eyebrow_type: ['thick', 'thin', 'arched', 'straight'],
  nose_shape: ['straight', 'broad', 'pointed', 'aquiline'],
  lip_shape: ['thin', 'full', 'wide', 'heart-shaped'],
  hair_colour: HAIR_COLOURS,
  hair_style: ['short', 'long', 'curly', 'bald', 'wavy'],
  facial_hair: ['none', 'beard', 'moustache', 'stubble'],
  skin_tone: ['fair', 'medium', 'olive', 'dark'],
}
const FEATURE_LABELS = {
  face_shape: 'Face Shape',
  eye_shape: 'Eye Shape',
  eye_colour: 'Eye Colour',
  eyebrow_type: 'Eyebrow Type',
  nose_shape: 'Nose Shape',
  lip_shape: 'Lip Shape',
  hair_colour: 'Hair Colour',
  hair_style: 'Hair Style',
  facial_hair: 'Facial Hair',
  skin_tone: 'Skin Tone',
}

const CASE_STATUS_CLASS = {
  open: 'status-investigating',
  closed: 'status-closed',
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—')
const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleDateString()
}

function CriminalDatabase() {
  const navigate = useNavigate()
  const role = getRole()
  const canEdit = role === 'admin' || role === 'investigator'
  const canArchive = role === 'admin'

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [genderFilter, setGenderFilter] = useState('All')
  const [caseFilter, setCaseFilter] = useState('All')
  const [recordStatus, setRecordStatus] = useState('active')
  const [faceFilter, setFaceFilter] = useState('All')
  const [hairFilter, setHairFilter] = useState('All')

  const [editTarget, setEditTarget] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Wait 300 ms after typing stops before searching
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Load profiles from the backend whenever a server-side filter changes
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    listProfiles({
      q: debouncedQuery,
      status: recordStatus,
      face_shape: faceFilter,
      hair_colour: hairFilter,
      per_page: 100,
    })
      .then((data) => {
        if (cancelled) return
        setRecords(data.items)
        setTotal(data.total)
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [debouncedQuery, recordStatus, faceFilter, hairFilter, reloadKey])

  // Gender and case-status filters are applied in the browser
  const filteredRecords = records.filter((c) => {
    const matchesGender = genderFilter === 'All' || c.gender === genderFilter
    const matchesCase =
      caseFilter === 'All' || (c.cases || []).some((k) => k.status === caseFilter)
    return matchesGender && matchesCase
  })

  const stats = [
    { label: 'Total Records', value: total, icon: Database, color: 'cyan' },
    {
      label: 'Active Profiles',
      value: records.filter((c) => c.status === 'active').length,
      icon: ShieldCheck,
      color: 'green',
    },
    {
      label: 'Linked to Open Case',
      value: records.filter((c) => (c.cases || []).some((k) => k.status === 'open')).length,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Linked to Closed Case',
      value: records.filter((c) => (c.cases || []).some((k) => k.status === 'closed')).length,
      icon: FileX,
      color: 'gray',
    },
  ]

  function openAdd() {
    setSaveError('')
    setEditTarget({ isNew: true, name: '', age: '', gender: 'Male', height: '', features: {} })
  }

  function openEdit(c) {
    setSaveError('')
    setEditTarget({
      isNew: false,
      profile_code: c.profile_code,
      name: c.name || '',
      age: c.age ?? '',
      gender: c.gender || 'Male',
      height: c.height || '',
      features: { ...(c.features || {}) },
    })
  }

  function setFeature(key, value) {
    setEditTarget({ ...editTarget, features: { ...editTarget.features, [key]: value } })
  }

  async function handleEditSave() {
    if (!editTarget) return
    if (!editTarget.name.trim()) {
      setSaveError('Name is required.')
      return
    }
    setSaving(true)
    setSaveError('')
    const body = {
      name: editTarget.name.trim(),
      age: editTarget.age === '' ? null : parseInt(editTarget.age, 10),
      gender: editTarget.gender,
      height: editTarget.height,
      features: editTarget.features,
    }
    try {
      if (editTarget.isNew) await createProfile(body)
      else await updateProfile(editTarget.profile_code, body)
      setEditTarget(null)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleArchive() {
    if (!deleteTarget) return
    try {
      await archiveProfile(deleteTarget.profile_code)
      setDeleteTarget(null)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setDeleteTarget(null)
      setError(err.message)
    }
  }

  function renderFeatureSelect(key) {
    return (
      <div className="edit-field" key={key}>
        <label>{FEATURE_LABELS[key]}</label>
        <select
          value={editTarget.features[key] || ''}
          onChange={(e) => setFeature(key, e.target.value)}
        >
          <option value="">—</option>
          {FEATURE_OPTIONS[key].map((o) => (
            <option key={o} value={o}>
              {cap(o)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="criminal-db-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Criminal Database</h1>
          <p>Search and manage fictional test profiles from the forensic database.</p>
        </div>
        {canEdit && (
          <button className="page-btn primary" onClick={openAdd}>
            <Plus />
            Add Profile
          </button>
        )}
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: 16, color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="db-stats-grid">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="db-stat-card glass-panel">
              <div className={`db-stat-icon ${s.color}`}>
                <Icon />
              </div>
              <div>
                <div className="db-stat-value">{s.value}</div>
                <div className="db-stat-label">{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + Filters */}
      <div className="db-filter-bar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search by Name or Profile ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="db-select" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select className="db-select" value={faceFilter} onChange={(e) => setFaceFilter(e.target.value)}>
          <option value="All">All Face Shapes</option>
          {FACE_SHAPES.map((o) => (
            <option key={o} value={o}>{cap(o)}</option>
          ))}
        </select>
        <select className="db-select" value={hairFilter} onChange={(e) => setHairFilter(e.target.value)}>
          <option value="All">All Hair Colours</option>
          {HAIR_COLOURS.map((o) => (
            <option key={o} value={o}>{cap(o)}</option>
          ))}
        </select>
        <select className="db-select" value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)}>
          <option value="All">All Case Statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <select className="db-select" value={recordStatus} onChange={(e) => setRecordStatus(e.target.value)}>
          <option value="active">Active records</option>
          <option value="archived">Archived records</option>
          <option value="all">All records</option>
        </select>
      </div>

      {/* Table */}
      <div className="db-table-wrap glass-panel">
        <div className="db-table-scroll">
          <table className="db-table">
            <thead>
              <tr>
                <th>Profile ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Face Shape</th>
                <th>Hair</th>
                <th>Case ID</th>
                <th>Case Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((c) => {
                const firstCase = (c.cases || [])[0]
                return (
                  <tr key={c.id}>
                    <td className="db-criminal-id">{c.profile_code}</td>
                    <td className="db-name">{c.name}</td>
                    <td>{c.age ?? '—'}</td>
                    <td>{c.gender || '—'}</td>
                    <td>{cap(c.features?.face_shape)}</td>
                    <td>
                      {cap(c.features?.hair_colour)} {c.features?.hair_style ? `· ${c.features.hair_style}` : ''}
                    </td>
                    <td className="db-case-id">{firstCase ? firstCase.case_code : '—'}</td>
                    <td>
                      {firstCase ? (
                        <span className={`case-status ${CASE_STATUS_CLASS[firstCase.status] || ''}`}>
                          {cap(firstCase.status)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="db-time">{fmtDate(c.updated_at)}</td>
                    <td>
                      <div className="db-action-btns">
                        <button
                          className="db-action-btn"
                          onClick={() => navigate(`/criminal-profile/${c.profile_code}`)}
                          title="View Profile"
                        >
                          <Eye />
                        </button>
                        {firstCase && (
                          <button
                            className="db-action-btn"
                            onClick={() => navigate(`/case-details/${firstCase.case_code}`)}
                            title="Open Case"
                          >
                            <FolderOpen />
                          </button>
                        )}
                        {canEdit && (
                          <button className="db-action-btn" onClick={() => openEdit(c)} title="Edit">
                            <Pencil />
                          </button>
                        )}
                        {canArchive && c.status === 'active' && (
                          <button
                            className="db-action-btn danger"
                            onClick={() => setDeleteTarget(c)}
                            title="Archive"
                          >
                            <Archive />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="db-no-results">
            <p>Loading records...</p>
          </div>
        )}
        {!loading && filteredRecords.length === 0 && (
          <div className="db-no-results">
            <Search />
            <p>No records found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div
            className="edit-modal"
            style={{ maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-header">
              <h2>{editTarget.isNew ? 'Add New Profile' : `Edit Record — ${editTarget.profile_code}`}</h2>
              <button className="edit-modal-close" onClick={() => setEditTarget(null)}>
                <X />
              </button>
            </div>
            <div className="edit-modal-body">
              {saveError && <div style={{ color: '#ff6b6b', marginBottom: 8 }}>{saveError}</div>}
              <div className="edit-field">
                <label>Name (fictional)</label>
                <input
                  type="text"
                  value={editTarget.name}
                  onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                />
              </div>
              <div className="edit-field">
                <label>Age</label>
                <input
                  type="number"
                  value={editTarget.age}
                  onChange={(e) => setEditTarget({ ...editTarget, age: e.target.value })}
                />
              </div>
              <div className="edit-field">
                <label>Gender</label>
                <select
                  value={editTarget.gender}
                  onChange={(e) => setEditTarget({ ...editTarget, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="edit-field">
                <label>Height (e.g. 5'8")</label>
                <input
                  type="text"
                  value={editTarget.height}
                  onChange={(e) => setEditTarget({ ...editTarget, height: e.target.value })}
                />
              </div>

              {Object.keys(FEATURE_OPTIONS).map(renderFeatureSelect)}

              <div className="edit-field">
                <label>Distinguishing Marks (fictional)</label>
                <input
                  type="text"
                  value={editTarget.features.marks || ''}
                  onChange={(e) => setFeature('marks', e.target.value)}
                />
              </div>
            </div>
            <div className="edit-modal-actions">
              <button className="page-btn" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="page-btn primary" onClick={handleEditSave} disabled={saving}>
                {saving ? 'Saving...' : editTarget.isNew ? 'Create Profile' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        title="Archive Record?"
        message={`Archive the record for ${deleteTarget?.name}? It will be hidden from the default list but kept in the database.`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        onConfirm={handleArchive}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default CriminalDatabase
