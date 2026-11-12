
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ScanFace,
  Play,
  Eye,
  RotateCcw,
  Save,
  FileDown,
  User,
  ImageOff,
  PenTool,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

import {
  criminals,
  aiMatchResults,
  featureSimilarity,
  matchingFeatures,
} from '../data/mockData'

import { getSavedSketches } from '../services/sketchStorage'
import '../styles/aiAnalysis.css'

const CONFIDENCE_COLORS = {
  High: 'conf-high',
  Medium: 'conf-medium',
  Low: 'conf-low',
}

function AIAnalysis() {
  const navigate = useNavigate()
  const location = useLocation()

  const [sketches, setSketches] = useState([])
  const [selectedSketchId, setSelectedSketchId] = useState('')
  const [selectedCriminalId, setSelectedCriminalId] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [reports, setReports] = useState([])
  const [imgErrors, setImgErrors] = useState({})

  const progressTimerRef = useRef(null)

  // Load sketches and saved reports
  useEffect(() => {
    const allSketches = getSavedSketches()
    setSketches(allSketches)

    if (location.state?.sketch) {
      setSelectedSketchId(location.state.sketch.id)
    }

    if (location.state?.criminalId) {
      setSelectedCriminalId(location.state.criminalId)
    }

    const savedReports = JSON.parse(
      localStorage.getItem('forensiq_ai_reports') || '[]'
    )

    setReports(savedReports)
  }, [location.state])

  // Cleanup timer
  useEffect(() => {
    return () => clearInterval(progressTimerRef.current)
  }, [])

  const selectedSketch = sketches.find(
    (s) => s.id === selectedSketchId
  )

  const selectedCriminal = criminals.find(
    (c) => c.id === selectedCriminalId
  )

  // Empty state when no sketches are available
  if (sketches.length === 0) {
    return (
      <div className="ai-analysis-page">
        <div className="page-header">
          <div>
            <h1>AI Match & Analysis</h1>
            <p>Compare generated sketches with criminal database profiles.</p>
          </div>
          <span className="demo-badge">
            <Sparkles />
            ForensIQ Analysis
          </span>
        </div>

        <div className="empty-state">
          <div className="empty-state-icon">
            <ImageOff />
          </div>
          <h2>No generated sketches available.</h2>
          <p>
            Generate a sketch first to use the sketch comparison feature.
          </p>
          <button
            className="page-btn primary"
            onClick={() => navigate('/sketch-generation')}
          >
            <PenTool />
            Go to Sketch Generator
          </button>
        </div>
      </div>
    )
  }

  // -----------------------------------------
  // EXISTING SKETCH MATCHING FUNCTIONALITY
  // -----------------------------------------

  function handleRunMatch() {
    if (!selectedSketchId) return

    setIsRunning(true)
    setProgress(0)
    setResults(null)

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current)

          setTimeout(() => {
            setResults({
              matches: aiMatchResults,
              features: featureSimilarity,
              summary:
                'This simulated analysis found similarities in eye placement, eyebrow geometry, nose structure, and overall facial proportions. These results are generated using mock demonstration data and do not represent a real facial recognition system.',
              sketchId: selectedSketchId,
              criminalId:
                selectedCriminalId || aiMatchResults[0].criminalId,
              date: new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }),
            })

            setIsRunning(false)
          }, 300)

          return 100
        }

        return prev + 2
      })
    }, 40)
  }

  function handleReset() {
    setResults(null)
    setProgress(0)
    setSelectedSketchId('')
    setSelectedCriminalId('')
  }

  function handleSaveAnalysis() {
    if (!results) return

    const report = {
      id: `RPT-${Date.now()}`,
      date: results.date,
      sketchId: results.sketchId,
      criminalId: results.criminalId,
      criminalName: selectedCriminal?.name || aiMatchResults[0].name,
      matchScore: aiMatchResults[0].matchScore,
      confidence: aiMatchResults[0].confidence,
      features: matchingFeatures,
      summary: results.summary,
    }

    const updated = [...reports, report]

    setReports(updated)
    localStorage.setItem('forensiq_ai_reports', JSON.stringify(updated))
  }

  function handleGenerateReport() {
    if (!results) return

    const topMatch = aiMatchResults[0]

    const criminal = selectedCriminal || {
      name: topMatch.name,
      id: topMatch.criminalId,
    }

    const reportText = `FORENSIQ AI ANALYSIS REPORT
============================
Date: ${results.date}
Sketch ID: ${results.sketchId}
Criminal: ${criminal.name} (${criminal.id})
Match Score: ${topMatch.matchScore}%
Confidence: ${topMatch.confidence}

MATCHING FEATURES:
${matchingFeatures.join(', ')}

FEATURE SIMILARITY:
${featureSimilarity.map((f) => `${f.feature}: ${f.score}%`).join('\n')}

SUMMARY:
${results.summary}

NOTE: This is a simulated demo report. No real facial recognition was performed.
`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `ForensIQ_Report_${criminal.id}.txt`
    link.click()

    URL.revokeObjectURL(url)
  }

  function handleImageError(id) {
    setImgErrors((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="ai-analysis-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>AI Match & Analysis</h1>
          <p>
            Compare generated sketches with criminal database profiles.
          </p>
        </div>

        <span className="demo-badge">
          <Sparkles />
          ForensIQ Analysis
        </span>
      </div>

      {/* Existing Sketch Analysis Input */}
      {!results && (
        <div className="ai-input-section glass-panel fi-fade-in">
          <div className="ai-input-grid">
            <div className="ai-input-panel">
              <h3>Generated Sketch</h3>

              <select
                className="ai-select"
                value={selectedSketchId}
                onChange={(e) => setSelectedSketchId(e.target.value)}
              >
                <option value="">Select a sketch...</option>

                {sketches.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.caseId}
                  </option>
                ))}
              </select>

              {selectedSketch && (
                <div className="ai-sketch-preview">
                  {selectedSketch.image && !imgErrors[selectedSketch.id] ? (
                    <img
                      src={selectedSketch.image}
                      alt={selectedSketch.id}
                      onError={() => handleImageError(selectedSketch.id)}
                    />
                  ) : (
                    <div className="sketch-preview-placeholder small">
                      <ImageOff />
                      <span>Preview unavailable</span>
                    </div>
                  )}

                  <div className="ai-sketch-meta">
                    <span>{selectedSketch.id}</span>
                    <span>{selectedSketch.caseId}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="ai-input-panel">
              <h3>Criminal Database</h3>

              <select
                className="ai-select"
                value={selectedCriminalId}
                onChange={(e) => setSelectedCriminalId(e.target.value)}
              >
                <option value="">Select a criminal record...</option>

                {criminals.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.id}
                  </option>
                ))}
              </select>

              {selectedCriminal && (
                <div className="ai-criminal-preview">
                  <div className="ai-criminal-avatar">
                    <User />
                  </div>

                  <div className="ai-criminal-meta">
                    <span className="ai-criminal-name">
                      {selectedCriminal.name}
                    </span>
                    <span className="ai-criminal-id">
                      {selectedCriminal.id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="ai-run-section">
            <button
              className="page-btn primary large"
              onClick={handleRunMatch}
              disabled={!selectedSketchId || isRunning}
            >
              {isRunning ? <span className="fi-spinner" /> : <Play />}
              Run AI Match
            </button>
          </div>

          {isRunning && (
            <div className="ai-progress-section">
              <div className="ai-scan-effect">
                <ScanFace />
                <span>AI scanning facial features...</span>
              </div>

              <div className="ai-progress-bar">
                <div
                  className="ai-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="ai-progress-text">
                {progress}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Existing Sketch Match Results */}
      {results && !isRunning && (
        <div className="ai-results-section fi-fade-in">
          <div className="ai-comparison glass-panel">
            <h2 className="card-title">Comparison View</h2>

            <div className="ai-comparison-grid">
              <div className="ai-comparison-side">
                <span className="ai-comparison-label">
                  Generated Sketch
                </span>

                <div className="ai-comparison-image">
                  {selectedSketch?.image && !imgErrors[selectedSketch.id] ? (
                    <img
                      src={selectedSketch.image}
                      alt="Generated sketch"
                      onError={() => handleImageError(selectedSketch.id)}
                    />
                  ) : (
                    <div className="sketch-preview-placeholder">
                      <ImageOff />
                      <span>Sketch preview unavailable</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="ai-comparison-side">
                <span className="ai-comparison-label">
                  Database Profile
                </span>

                <div className="ai-comparison-image">
                  <div className="ai-db-placeholder">
                    <User />
                    <span>
                      {selectedCriminal?.name || aiMatchResults[0].name}
                    </span>
                    <span className="ai-db-id">
                      {selectedCriminal?.id || aiMatchResults[0].criminalId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ai-match-results glass-panel">
            <h2 className="card-title">Match Results</h2>

            <div className="match-results-grid">
              {results.matches.map((match, idx) => (
                <div
                  key={match.id}
                  className={`match-card ${idx === 0 ? 'top-match' : ''}`}
                >
                  <div className="match-card-avatar">
                    <User />
                  </div>

                  <div className="match-card-info">
                    <span className="match-card-name">
                      {match.name}
                    </span>
                    <span className="match-card-id">
                      {match.criminalId}
                    </span>
                  </div>

                  <div className="match-card-score">
                    <div className="circular-score">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="circular-score-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circular-score-fill"
                          strokeDasharray={`${match.matchScore}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text
                          x="18"
                          y="20.5"
                          className="circular-score-text"
                        >
                          {match.matchScore}%
                        </text>
                      </svg>
                    </div>

                    <span
                      className={`confidence-badge ${CONFIDENCE_COLORS[match.confidence]}`}
                    >
                      {match.confidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-features-section glass-panel">
            <h2 className="card-title">Matching Features</h2>

            <div className="feature-chips">
              {matchingFeatures.map((f) => (
                <span key={f} className="feature-chip highlighted">
                  {f}
                </span>
              ))}
            </div>

            <div className="feature-similarity-bars">
              {results.features.map((f) => (
                <div key={f.feature} className="feature-bar-row">
                  <span className="feature-bar-label">
                    {f.feature}
                  </span>

                  <div className="feature-bar-track">
                    <div
                      className="feature-bar-fill"
                      style={{
                        width: `${f.score}%`,
                        animation: 'barGrow 0.8s ease-out',
                      }}
                    />
                  </div>

                  <span className="feature-bar-score">
                    {f.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="ai-summary-panel glass-panel">
            <h2 className="card-title">
              <AlertCircle />
              Analysis Summary
            </h2>

            <p>{results.summary}</p>
          </div>

          <div className="ai-result-actions">
            <button
              className="page-btn primary"
              onClick={() =>
                navigate(`/criminal-profile/${results.criminalId}`)
              }
            >
              <Eye />
              View Criminal Profile
            </button>

            <button className="page-btn" onClick={handleReset}>
              <RotateCcw />
              Compare Another Sketch
            </button>

            <button className="page-btn" onClick={handleSaveAnalysis}>
              <Save />
              Save Analysis
            </button>

            <button className="page-btn" onClick={handleGenerateReport}>
              <FileDown />
              Generate Report
            </button>
          </div>
        </div>
      )}

      {/* Existing Recent Analysis History */}
      {reports.length > 0 && (
        <div className="ai-history-section glass-panel fi-fade-in">
          <h2 className="card-title">
            Recent Analysis History
          </h2>

          <div className="ai-history-grid">
            {reports.slice().reverse().map((r) => (
              <div key={r.id} className="ai-history-card">
                <div className="ai-history-date">{r.date}</div>
                <div className="ai-history-criminal">{r.criminalName}</div>
                <div className="ai-history-score">
                  Match Score: {r.matchScore}%
                </div>

                <button
                  className="page-btn small"
                  onClick={() =>
                    navigate(`/criminal-profile/${r.criminalId}`)
                  }
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAnalysis
