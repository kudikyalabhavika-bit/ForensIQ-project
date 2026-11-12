import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderPlus,
  Upload,
  RefreshCw,
  Search,
  Eye,
  Trash2,
  ScanFace,
  FolderOpen,
  ImageOff,
  Download,
  X,
  PenTool,
} from 'lucide-react'
import Modal from '../components/Modal'
import { getSavedSketches, deleteSketch } from '../services/sketchStorage'
import { API_BASE_URL } from '../services/api'
import '../styles/savedCases.css'

function SavedCases() {
  const navigate = useNavigate()

  const [sketches, setSketches] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewSketch, setViewSketch] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [imgErrors, setImgErrors] = useState({})

  // Load sketches from localStorage on mount and sort newest first
  function loadSketches() {
    const all = getSavedSketches()
    // Sort by createdAt descending (newest first)
    const sorted = [...all].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    // Simple string sort as fallback if date parsing fails
    if (isNaN(new Date(all[0]?.createdAt))) {
      sorted.reverse()
    }
    setSketches(sorted)
  }

  useEffect(() => {
    loadSketches()
  }, [])

  // Filter sketches based on search + status
  const filteredSketches = sketches.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.caseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.suspect?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.investigator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter

    return matchesSearch && matchesStatus
  })

  function handleDelete() {
    if (!deleteTarget) return
    const updated = deleteSketch(deleteTarget.id)
    setSketches(updated)
    setDeleteTarget(null)
  }

  function handleImageError(id) {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  function handleDownload(sketch) {
    if (sketch.image) {
      const link = document.createElement('a')
      link.href = sketch.image
      link.download = `${sketch.id}.png`
      link.target = '_blank'
      link.click()
    }
  }

  const statusOptions = ['All', 'Active', 'Generated', 'Closed', 'Pending']

  return (
    <div className="saved-cases-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Saved Investigation Cases</h1>
          <p>View previously generated forensic sketches and investigation cases.</p>
        </div>
        <div className="page-header-actions">
          <button className="page-btn primary" onClick={() => navigate('/sketch-generation')}>
            <PenTool />
            Create New Case
          </button>
          <button className="page-btn" onClick={() => navigate('/sketch-generation')}>
            <Upload />
            Import Sketch
          </button>
          <button className="page-btn" onClick={loadSketches}>
            <RefreshCw />
            Refresh History
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="filter-bar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search by Case ID, Suspect, or Investigator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          {statusOptions.map((s) => (
            <button
              key={s}
              className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Sketch grid or empty state */}
      {filteredSketches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ImageOff />
          </div>
          <h2>No saved sketches yet.</h2>
          <p>Generate a forensic sketch and save it to see it here.</p>
          <button className="page-btn primary" onClick={() => navigate('/sketch-generation')}>
            <PenTool />
            Go to Sketch Generator
          </button>
        </div>
      ) : (
        <div className="sketch-grid">
          {filteredSketches.map((sketch) => (
            <div key={sketch.id} className="sketch-card glass-panel">
              {/* Preview image */}
              <div className="sketch-card-preview">
                {sketch.image && !imgErrors[sketch.id] ? (
                  <img
                    src={sketch.image}
                    alt={`Sketch ${sketch.id}`}
                    onError={() => handleImageError(sketch.id)}
                  />
                ) : (
                  <div className="sketch-preview-placeholder">
                    <ImageOff />
                    <span>Sketch preview unavailable</span>
                  </div>
                )}
                <span className={`sketch-status-badge ${sketch.status?.toLowerCase()}`}>
                  {sketch.status}
                </span>
              </div>

              {/* Info */}
              <div className="sketch-card-info">
                <div className="sketch-card-id">{sketch.caseId}</div>
                <div className="sketch-card-sub-id">{sketch.id}</div>
                <div className="sketch-card-row">
                  <span className="sketch-card-label">Suspect:</span>
                  <span>{sketch.suspect}</span>
                </div>
                <div className="sketch-card-row">
                  <span className="sketch-card-label">Investigator:</span>
                  <span>{sketch.investigator}</span>
                </div>
                <div className="sketch-card-row">
                  <span className="sketch-card-label">Created:</span>
                  <span>{sketch.createdAt}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="sketch-card-actions">
                <button className="sketch-action-btn" onClick={() => navigate(`/case-details/${sketch.caseId}`)}>
                  <FolderOpen />
                  Open Case
                </button>
                <button className="sketch-action-btn" onClick={() => setViewSketch(sketch)}>
                  <Eye />
                  View Sketch
                </button>
                <button className="sketch-action-btn" onClick={() => navigate('/ai-analysis')}>
                  <ScanFace />
                  AI Analysis
                </button>
                <button className="sketch-action-btn danger" onClick={() => setDeleteTarget(sketch)}>
                  <Trash2 />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Sketch Modal */}
      {viewSketch && (
        <div className="modal-overlay" onClick={() => setViewSketch(null)}>
          <div className="view-sketch-modal" onClick={(e) => e.stopPropagation()}>
            <button className="view-sketch-close" onClick={() => setViewSketch(null)}>
              <X />
            </button>
            <h2>Sketch Preview</h2>
            <div className="view-sketch-image">
              {viewSketch.image && !imgErrors[viewSketch.id] ? (
                <img
                  src={viewSketch.image}
                  alt={`Sketch ${viewSketch.id}`}
                  onError={() => handleImageError(viewSketch.id)}
                />
              ) : (
                <div className="sketch-preview-placeholder large">
                  <ImageOff />
                  <span>Sketch preview unavailable</span>
                </div>
              )}
            </div>
            <div className="view-sketch-details">
              <div className="view-sketch-row">
                <span className="view-sketch-label">Case ID:</span>
                <span className="view-sketch-value">{viewSketch.caseId}</span>
              </div>
              <div className="view-sketch-row">
                <span className="view-sketch-label">Sketch ID:</span>
                <span className="view-sketch-value">{viewSketch.id}</span>
              </div>
              <div className="view-sketch-row">
                <span className="view-sketch-label">Created:</span>
                <span className="view-sketch-value">{viewSketch.createdAt}</span>
              </div>
              <div className="view-sketch-row">
                <span className="view-sketch-label">Investigator:</span>
                <span className="view-sketch-value">{viewSketch.investigator}</span>
              </div>
              <div className="view-sketch-row">
                <span className="view-sketch-label">Notes:</span>
                <span className="view-sketch-value">{viewSketch.notes}</span>
              </div>
            </div>
            <div className="view-sketch-actions">
              <button
                className="page-btn primary"
                onClick={() => handleDownload(viewSketch)}
                disabled={!viewSketch.image}
              >
                <Download />
                Download Sketch
              </button>
              <button className="page-btn" onClick={() => setViewSketch(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        title="Delete Sketch?"
        message={`Are you sure you want to delete ${deleteTarget?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default SavedCases
