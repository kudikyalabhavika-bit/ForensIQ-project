import {
  Undo2,
  Redo2,
  ZoomOut,
  ZoomIn,
  Maximize,
  Trash2,
  Eraser,
  Save,
  LayoutDashboard,
} from 'lucide-react'

function Toolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomOut,
  onZoomIn,
  onZoomReset,
  onDeleteSelected,
  onClearCanvas,
  onSave,
  onBackToDashboard,
  hasSelection,
  isSaving,
}) {
  return (
    <div className="sketch-toolbar">
      {/* Back to Dashboard */}
      <div className="toolbar-group" style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '8px', marginRight: '4px' }}>
        <button
          className="toolbar-btn"
          onClick={onBackToDashboard}
          aria-label="Back to Dashboard"
        >
          <LayoutDashboard />
          <span className="tip">Back to Dashboard</span>
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
        >
          <Undo2 />
          <span className="tip">Undo</span>
        </button>
        <button
          className="toolbar-btn"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
        >
          <Redo2 />
          <span className="tip">Redo</span>
        </button>
      </div>

      {/* Zoom */}
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={onZoomOut} aria-label="Zoom out">
          <ZoomOut />
          <span className="tip">Zoom Out</span>
        </button>
        <span className="zoom-display">{Math.round(zoom * 100)}%</span>
        <button className="toolbar-btn" onClick={onZoomIn} aria-label="Zoom in">
          <ZoomIn />
          <span className="tip">Zoom In</span>
        </button>
        <button className="toolbar-btn" onClick={onZoomReset} aria-label="Reset zoom">
          <Maximize />
          <span className="tip">Reset Zoom</span>
        </button>
      </div>

      {/* Delete / Clear */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn danger"
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          aria-label="Delete selected"
        >
          <Trash2 />
          <span className="tip">Delete Selected</span>
        </button>
        <button
          className="toolbar-btn danger"
          onClick={onClearCanvas}
          aria-label="Clear canvas"
        >
          <Eraser />
          <span className="tip">Clear Canvas</span>
        </button>
      </div>

      <div className="toolbar-spacer" />

      {/* Save */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn-text"
          onClick={onSave}
          disabled={isSaving}
          aria-label="Save sketch"
        >
          {isSaving ? <span className="fi-spinner" /> : <Save />}
          <span>Save Sketch</span>
        </button>
      </div>
    </div>
  )
}

export default Toolbar
