import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  ScanFace,
  FolderOpen,
  Database,
  Save,
  Trash2,
  ImageOff,
  Download,
  Eye,
  PenTool,
  Upload,
} from 'lucide-react'
import { getProfile, uploadImage, getRole, imageSrc } from '../services/dbApi'
import { getSavedSketches } from '../services/sketchStorage'
import '../styles/criminalProfile.css'

const CASE_STATUS_CLASS = {
  open: 'status-investigating',
  closed: 'status-closed',
}

const FEATURE_ROWS = [
  ['face_shape', 'Face Shape'],
  ['eye_shape', 'Eye Shape'],
  ['eye_colour', 'Eye Colour'],
  ['eyebrow_type', 'Eyebrow Type'],
  ['nose_shape', 'Nose Shape'],
  ['lip_shape', 'Lip Shape'],
  ['hair_colour', 'Hair Colour'],
  ['hair_style', 'Hair Style'],
  ['facial_hair', 'Facial Hair'],
  ['skin_tone', 'Skin Tone'],
  ['marks', 'Distinguishing Marks'],
]

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '—')
const fmtDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return isNaN(d) ? '—' : d.toLocaleString()
}

function CriminalProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const role = getRole()
  const canEdit = role === 'admin' || role === 'investigator'

  const [criminal, setCriminal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [uploadType, setUploadType] = useState('additional')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Related sketch from localStorage (sketch generator output)
  const [relatedSketch, setRelatedSketch] = useState(null)
  const [imgError, setImgError] = useState(false)

  // Investigation notes (saved in localStorage)
  const notesKey = `forensiq_notes_${id}`
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)

  // Load the profile from the backend
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    getProfile(id)
      .then((data) => !cancelled && setCriminal(data))
      .catch((err) => {
        if (!cancelled) {
          setCriminal(null)
          setLoadError(err.message)
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  const caseCode = criminal?.cases?.[0]?.case_code

  // Load notes and related sketch
  useEffect(() => {
    const savedNotes = localStorage.getItem(notesKey)
    setNotes(savedNotes || '')

    const sketches = getSavedSketches()
    const sketch = caseCode ? sketches.find((s) => s.caseId === caseCode) : null
    setRelatedSketch(sketch || null)
    setImgError(false)
  }, [notesKey, caseCode])

  function handleSaveNotes() {
    localStorage.setItem(notesKey, notes)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  function handleClearNotes() {
    setNotes('')
    localStorage.removeItem(notesKey)
  }

  function handleDownloadSketch() {
    if (relatedSketch?.image) {
      const link = document.createElement('a')
      link.href = relatedSketch.image
      link.download = `${relatedSketch.id}.png`
      link.target = '_blank'
      link.click()
    }
  }

  function handleCompareInAI() {
    navigate('/ai-analysis', {
      state: { criminalId: id, sketch: relatedSketch },
    })
  }

  async function handleFileChosen(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      await uploadImage(criminal.profile_code, file, uploadType)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading && !criminal) {
    return (
      <div className="placeholder-page fi-fade-in">
        <div className="placeholder-card glass-panel">
          <h1>Loading...</h1>
        </div>
      </div>
    )
  }

  // Profile not found or backend error
  if (!criminal) {
    return (
      <div className="placeholder-page fi-fade-in">
        <div className="placeholder-card glass-panel">
          <div className="placeholder-icon">
            <User />
          </div>
          <h1>Record Not Found</h1>
          <p>
            No record found for ID <strong>{id}</strong>.
          </p>
          {loadError && <p style={{ color: '#ff6b6b' }}>{loadError}</p>}
          <button className="placeholder-back-btn" onClick={() => navigate('/criminal-database')}>
            <ArrowLeft />
            Back to Database
          </button>
        </div>
      </div>
    )
  }

  const cases = criminal.cases || []
  const images = criminal.images || []
  const features = criminal.features || {}
  const mainImage = images.find((i) => i.image_type === 'profile') || images.find((i) => i.image_type === 'front') || images[0]

  const profileFields = [
    { label: 'Profile ID', value: criminal.profile_code },
    { label: 'Name', value: criminal.name },
    { label: 'Age', value: criminal.age ?? '—' },
    { label: 'Gender', value: criminal.gender || '—' },
    { label: 'Height', value: criminal.height || '—' },
    { label: 'Identification Status', value: criminal.identification_status || '—' },
    { label: 'Record Status', value: cap(criminal.status) },
    { label: 'Linked Cases', value: cases.length ? cases.map((c) => c.case_code).join(', ') : 'None' },
    { label: 'Created By', value: criminal.created_by || '—' },
    { label: 'Last Updated', value: fmtDateTime(criminal.updated_at) },
  ]

  return (
    <div className="criminal-profile-page">
      {/* Header */}
      <div className="profile-header fi-fade-in">
        <div className="profile-header-left">
          <button className="profile-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft />
            Back
          </button>
          <div className="profile-avatar">
            {mainImage ? (
              <img
                src={imageSrc(mainImage.url)}
                alt={criminal.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
              />
            ) : (
              <User />
            )}
          </div>
          <div className="profile-header-info">
            <h1>{criminal.name}</h1>
            <span className="profile-id">{criminal.profile_code}</span>
            <span className={`case-status ${criminal.status === 'active' ? 'status-active' : 'status-closed'}`}>
              {cap(criminal.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="profile-actions">
        {caseCode && (
          <button className="page-btn" onClick={() => navigate(`/case-details/${caseCode}`)}>
            <FolderOpen />
            Open Case
          </button>
        )}
        <button className="page-btn" onClick={() => navigate('/ai-analysis')}>
          <ScanFace />
          AI Analysis
        </button>
        <button className="page-btn" onClick={() => navigate('/saved-cases')}>
          <FolderOpen />
          Saved Cases
        </button>
        <button className="page-btn" onClick={() => navigate('/criminal-database')}>
          <Database />
          Back to Database
        </button>
      </div>

      {/* Main grid */}
      <div className="profile-grid">
        {/* Left column: profile info + physical features + notes */}
        <div className="profile-left-col">
          <div className="profile-info-card glass-panel fi-fade-in">
            <h2 className="card-title">Profile Information</h2>
            <div className="profile-info-grid">
              {profileFields.map((f) => (
                <div key={f.label} className="profile-info-row">
                  <span className="profile-info-label">{f.label}</span>
                  <span className="profile-info-value">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-info-card glass-panel fi-fade-in">
            <h2 className="card-title">Physical Description</h2>
            <div className="profile-info-grid">
              {FEATURE_ROWS.map(([key, label]) => (
                <div key={key} className="profile-info-row">
                  <span className="profile-info-label">{label}</span>
                  <span className="profile-info-value">{cap(features[key])}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-notes-card glass-panel fi-fade-in">
            <h2 className="card-title">Investigation Notes</h2>
            <textarea
              className="profile-notes-textarea"
              placeholder="Add investigation notes for this profile..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
            />
            <div className="notes-actions">
              {notesSaved && <span className="notes-saved">Notes saved!</span>}
              <button className="page-btn" onClick={handleClearNotes}>
                <Trash2 />
                Clear Notes
              </button>
              <button className="page-btn primary" onClick={handleSaveNotes}>
                <Save />
                Save Notes
              </button>
            </div>
          </div>
        </div>

        {/* Right column: photos + sketch */}
        <div className="profile-right-col">
          <div className="profile-evidence-card glass-panel fi-fade-in">
            <h2 className="card-title">Profile Photos</h2>
            {images.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No photos uploaded yet.</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                {images.map((img) => (
                  <div key={img.id} style={{ textAlign: 'center', fontSize: 12 }}>
                    <img
                      src={imageSrc(img.url)}
                      alt={img.image_code}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }}
                    />
                    <span style={{ opacity: 0.7 }}>{cap(img.image_type)}</span>
                  </div>
                ))}
              </div>
            )}

            {canEdit && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  className="db-select"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="profile">Profile photo</option>
                  <option value="front">Front-facing</option>
                  <option value="additional">Additional</option>
                </select>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={handleFileChosen}
                />
                <button className="page-btn primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Upload />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            )}
            {uploadError && <div style={{ color: '#ff6b6b', marginTop: 8 }}>{uploadError}</div>}
            <p style={{ opacity: 0.6, fontSize: 12, marginTop: 10 }}>
              Use AI-generated or stock faces only. Never upload photos of real people.
            </p>
          </div>

          <div className="profile-sketch-card glass-panel fi-fade-in">
            <h2 className="card-title">Related Forensic Sketch</h2>
            <div className="profile-sketch-preview">
              {relatedSketch && relatedSketch.image && !imgError ? (
                <img
                  src={relatedSketch.image}
                  alt={`Sketch for ${criminal.name}`}
                  onError={() => setImgError(true)}
                />
              ) : relatedSketch && !relatedSketch.image ? (
                <div className="sketch-preview-placeholder">
                  <ImageOff />
                  <span>Sketch preview unavailable</span>
                  <span className="sketch-id">{relatedSketch.id}</span>
                </div>
              ) : (
                <div className="sketch-preview-placeholder">
                  <PenTool />
                  <span>No sketch linked to this profile.</span>
                </div>
              )}
            </div>
            <div className="profile-sketch-actions">
              <button
                className="page-btn"
                onClick={() => relatedSketch && navigate('/saved-cases')}
                disabled={!relatedSketch}
              >
                <Eye />
                View Full Sketch
              </button>
              <button className="page-btn" onClick={handleDownloadSketch} disabled={!relatedSketch?.image}>
                <Download />
                Download Sketch
              </button>
              <button className="page-btn primary" onClick={handleCompareInAI}>
                <ScanFace />
                Compare in AI Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Linked cases */}
      <div className="profile-prev-cases glass-panel fi-fade-in">
        <h2 className="card-title">Linked Cases</h2>
        {cases.length === 0 ? (
          <p style={{ opacity: 0.7 }}>This profile is not linked to any case.</p>
        ) : (
          <div className="prev-cases-grid">
            {cases.map((pc) => (
              <div key={pc.id} className="prev-case-card">
                <div className="prev-case-id">{pc.case_code}</div>
                <div className="prev-case-name">{pc.category}</div>
                <div className="prev-case-meta">
                  <span>{pc.reference_no}</span>
                  <span>{pc.department}</span>
                </div>
                <div className="prev-case-bottom">
                  <span className={`case-status ${CASE_STATUS_CLASS[pc.status] || ''}`}>{cap(pc.status)}</span>
                  <button className="page-btn small" onClick={() => navigate(`/case-details/${pc.case_code}`)}>
                    Open Case
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CriminalProfile
