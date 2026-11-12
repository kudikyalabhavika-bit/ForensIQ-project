import { useState, useEffect, useRef, useCallback } from 'react'
import * as fabric from 'fabric'
import { Menu, PanelRight, CheckCircle2, XCircle, Info } from 'lucide-react'

import Toolbar from '../components/Toolbar'
import FeatureSidebar from '../components/FeatureSidebar'
import SketchCanvas from '../components/SketchCanvas'
import FeatureControls from '../components/FeatureControls'
import Modal from '../components/Modal'
import { getFeatures, generateSketch, getFeatureImageUrl, API_BASE_URL } from '../services/api'
import '../styles/sketch.css'

// All feature categories
const CATEGORIES = ['face', 'hair', 'eyes', 'eyebrows', 'nose', 'mouth', 'ears', 'beard', 'mustache', 'other']

// Generate a mock transparent PNG (as SVG data URI) for demo mode.
// These are simple line-art representations with transparent backgrounds.


// Build mock feature list for demo mode


let featureIdCounter = 0
function nextFeatureId() {
  featureIdCounter++
  return `feature-${String(featureIdCounter).padStart(3, '0')}`
}

function GenerateSketch() {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)

  const [features, setFeatures] = useState({})
  const [loadingFeatures, setLoadingFeatures] = useState(true)
  const [backendOnline, setBackendOnline] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [showClearModal, setShowClearModal] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  // Undo / Redo history
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const isRestoringRef = useRef(false)

  // ===== Toast helper =====
  const showToast = useCallback((type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ===== History management =====
  const takeSnapshot = useCallback(() => {
    const fc = fabricRef.current
    if (!fc || isRestoringRef.current) return

    const json = JSON.stringify(fc.toJSON(['featureId', 'featureType', 'featureFilename']))

    // Truncate redo history if we're not at the end
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(json)
    historyIndexRef.current = historyRef.current.length - 1

    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(false)
  }, [])

  const restoreSnapshot = useCallback((json) => {
    const fc = fabricRef.current
    if (!fc) return

    isRestoringRef.current = true
    fc.loadFromJSON(json).then(() => {
      fc.renderAll()
      isRestoringRef.current = false
      setSelectedFeature(null)
    })
  }, [])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    restoreSnapshot(historyRef.current[historyIndexRef.current])
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(true)
  }, [restoreSnapshot])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    restoreSnapshot(historyRef.current[historyIndexRef.current])
    setCanUndo(true)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }, [restoreSnapshot])

  // ===== Load features from backend (or mock) =====
  useEffect(() => {
    let cancelled = false

    async function loadAllFeatures() {
      setLoadingFeatures(true)

      try {
        // Try fetching all categories from Flask
        const results = await Promise.all(
          CATEGORIES.map(async (cat) => {
            try {
              const filenames = await getFeatures(cat)
              return {
                cat,
                items: filenames.map((fn) => ({
                  filename: fn,
                  url: getFeatureImageUrl(cat, fn),
                })),
              }
            } catch {
              return { cat, items: [] }
            }
          })
        )

        if (cancelled) return

        const merged = {}
        let anySuccess = false
        for (const { cat, items } of results) {
          merged[cat] = items
          if (items.length > 0) anySuccess = true
        }

        if (anySuccess) {
          setFeatures(merged)
          setBackendOnline(true)
        } else {
          // All categories failed → use mock
          setFeatures(merged)
          setBackendOnline(false)
        }
      } catch {
        if (cancelled) return
        setFeatures({})
        setBackendOnline(false)
      } finally {
        if (!cancelled) setLoadingFeatures(false)
      }
    }

    loadAllFeatures()

    return () => { cancelled = true }
  }, [])

  // ===== Selection change handler =====
  const handleSelectionChange = useCallback((fc) => {
    const active = fc?.getActiveObject()
    if (active) {
      setSelectedFeature({
        ...active.toObject(['featureId', 'featureType', 'featureFilename']),
        left: active.left,
        top: active.top,
        width: active.width,
        height: active.height,
        scaleX: active.scaleX,
        scaleY: active.scaleY,
      })
    } else {
      setSelectedFeature(null)
    }
  }, [])

  // ===== Object modified → update controls + history =====
  const handleObjectModified = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    handleSelectionChange(fc)
    takeSnapshot()
  }, [handleSelectionChange, takeSnapshot])

  // ===== Add feature to canvas =====
  const addFeature = useCallback(
    (type, item, dropX, dropY) => {
      const fc = fabricRef.current
      if (!fc) return

      const url = item.url || getFeatureImageUrl(type, item.filename)

      fabric.Image.fromURL(url, { crossOrigin: 'anonymous' }).then((img) => {
        // Scale image to a reasonable size on canvas
        const maxDim = 200
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)

        img.set({
          left: dropX ?? fc.width / 2,
          top: dropY ?? fc.height / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          featureId: nextFeatureId(),
          featureType: type,
          featureFilename: item.filename,
        })

        // Preserve transparency: no background added
        fc.add(img)
        fc.setActiveObject(img)
        fc.renderAll()

        takeSnapshot()
      })
    },
    [takeSnapshot]
  )

  // ===== Click-to-add from sidebar =====
  const handleAddFeature = useCallback(
    (type, item) => {
      addFeature(type, item)
      setLeftSidebarOpen(false)
    },
    [addFeature]
  )

  // ===== Drag-and-drop onto canvas =====
  const handleDropFeature = useCallback(
    (type, filename, url, dropEvent) => {
      const fc = fabricRef.current
      if (!fc) return

      // Calculate drop position relative to canvas
      const canvasEl = canvasRef.current
      const rect = canvasEl.getBoundingClientRect()
      const zoomFactor = fc.width / rect.width
      const dropX = (dropEvent.clientX - rect.left) * zoomFactor
      const dropY = (dropEvent.clientY - rect.top) * zoomFactor

      addFeature(type, { filename, url }, dropX, dropY)
    },
    [addFeature]
  )

  // ===== Zoom =====
  const applyZoom = useCallback((newZoom) => {
    const fc = fabricRef.current
    if (!fc) return
    const clamped = Math.max(0.2, Math.min(3, newZoom))
    fc.setZoom(clamped)
    fc.setDimensions({
      width: 600 * clamped,
      height: 600 * clamped,
    })
    fc.renderAll()
    setZoom(clamped)
  }, [])

  const handleZoomIn = useCallback(() => applyZoom(zoom + 0.1), [applyZoom, zoom])
  const handleZoomOut = useCallback(() => applyZoom(zoom - 0.1), [applyZoom, zoom])
  const handleZoomReset = useCallback(() => applyZoom(1), [applyZoom])

  // ===== Delete selected =====
  const deleteSelected = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const active = fc.getActiveObject()
    if (!active) return
    fc.remove(active)
    fc.discardActiveObject()
    fc.renderAll()
    setSelectedFeature(null)
    takeSnapshot()
  }, [takeSnapshot])

  // ===== Clear canvas =====
  const handleClearRequest = useCallback(() => {
    const fc = fabricRef.current
    if (!fc || fc.getObjects().length === 0) return
    setShowClearModal(true)
  }, [])

  const confirmClear = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    fc.clear()
    fc.backgroundColor = '#ffffff'
    fc.renderAll()
    setSelectedFeature(null)
    setShowClearModal(false)
    takeSnapshot()
  }, [takeSnapshot])

  // ===== Scale selected feature =====
  const makeBigger = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const active = fc.getActiveObject()
    if (!active) return
    active.scale(active.scaleX * 1.1)
    active.setCoords()
    fc.renderAll()
    handleSelectionChange(fc)
    takeSnapshot()
  }, [handleSelectionChange, takeSnapshot])

  const makeSmaller = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const active = fc.getActiveObject()
    if (!active) return
    active.scale(active.scaleX * 0.9)
    active.setCoords()
    fc.renderAll()
    handleSelectionChange(fc)
    takeSnapshot()
  }, [handleSelectionChange, takeSnapshot])

  // ===== Layer management =====
  const bringForward = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const active = fc.getActiveObject()
    if (!active) return
    fc.bringObjectForward(active)
    fc.renderAll()
    takeSnapshot()
  }, [takeSnapshot])

  const sendBackward = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const active = fc.getActiveObject()
    if (!active) return
    fc.sendObjectBackwards(active)
    fc.renderAll()
    takeSnapshot()
  }, [takeSnapshot])

  const bringToFront = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const active = fc.getActiveObject()
    if (!active) return
    fc.bringObjectToFront(active)
    fc.renderAll()
    takeSnapshot()
  }, [takeSnapshot])

  const sendToBack = useCallback(() => {
    const fc = fabricRef.current
    if (!fc) return
    const active = fc.getActiveObject()
    if (!active) return
    fc.sendObjectToBack(active)
    fc.renderAll()
    takeSnapshot()
  }, [takeSnapshot])

  // ===== Save sketch =====
  const handleSave = useCallback(async () => {
    const fc = fabricRef.current
    if (!fc) return

    const objects = fc.getObjects()
    if (objects.length === 0) {
      showToast('error', 'Canvas is empty. Add features before saving.')
      return
    }

    setIsSaving(true)

    // Collect feature data for Flask/Pillow compositing
    const featuresData = objects.map((obj, index) => ({
      type: obj.featureType || 'unknown',
      image: obj.featureFilename || 'unknown.png',
      x: Math.round(obj.left),
      y: Math.round(obj.top),
      width: Math.round(obj.width * obj.scaleX),
      height: Math.round(obj.height * obj.scaleY),
      scaleX: parseFloat(obj.scaleX.toFixed(4)),
      scaleY: parseFloat(obj.scaleY.toFixed(4)),
      layer: index,
    }))

    const payload = { features: featuresData }

    try {
      await generateSketch(payload)
      showToast('success', 'Sketch saved successfully.')
    } catch {
      showToast(
        'error',
        'Unable to connect to Flask backend. Please make sure the backend is running on port 5000.'
      )
    } finally {
      setIsSaving(false)
    }
  }, [showToast])

  // ===== Keyboard shortcuts =====
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't intercept when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (fabricRef.current?.getActiveObject()) {
          e.preventDefault()
          deleteSelected()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, undo, redo])

  // ===== Render =====
  return (
    <div className="sketch-page">
      <Toolbar
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        onZoomOut={handleZoomOut}
        onZoomIn={handleZoomIn}
        onZoomReset={handleZoomReset}
        onDeleteSelected={deleteSelected}
        onClearCanvas={handleClearRequest}
        onSave={handleSave}
        hasSelection={!!selectedFeature}
        isSaving={isSaving}
      />

      {/* Mobile toggle buttons */}
      <button
        className="mobile-toggle left"
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        aria-label="Toggle features panel"
      >
        <Menu />
      </button>
      <button
        className="mobile-toggle right"
        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        aria-label="Toggle controls panel"
      >
        <PanelRight />
      </button>

      <div className="sketch-body">
        <div className={`feature-sidebar ${leftSidebarOpen ? 'open' : ''}`}>
          <FeatureSidebar
            features={features}
            loading={loadingFeatures}
            backendOnline={backendOnline}
            onAddFeature={handleAddFeature}
          />
        </div>

        <SketchCanvas
          canvasRef={canvasRef}
          fabricRef={fabricRef}
          onSelectionChange={handleSelectionChange}
          onObjectModified={handleObjectModified}
          onHistorySnapshot={takeSnapshot}
          onDropFeature={handleDropFeature}
        />

        <div className={`control-sidebar ${rightSidebarOpen ? 'open' : ''}`}>
          <FeatureControls
            selectedFeature={selectedFeature}
            onBigger={makeBigger}
            onSmaller={makeSmaller}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onDeleteFeature={deleteSelected}
          />
        </div>
      </div>

      {/* Clear confirmation modal */}
      <Modal
        isOpen={showClearModal}
        title="Clear Sketch?"
        message="Are you sure you want to clear the sketch? All facial features will be removed."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={confirmClear}
        onCancel={() => setShowClearModal(false)}
      />

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 />}
            {toast.type === 'error' && <XCircle />}
            {toast.type === 'info' && <Info />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Backend offline notice */}
      {!backendOnline && !loadingFeatures && (
        <div className="toast-container" style={{ bottom: '70px' }}>
          <div className="toast info">
            <Info />
            <span>Backend unavailable — using demo assets</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default GenerateSketch
