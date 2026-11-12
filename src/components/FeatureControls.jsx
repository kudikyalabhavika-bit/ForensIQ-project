import {
  MousePointerClick,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react'

function FeatureControls({ selectedFeature, onBigger, onSmaller, onBringForward, onSendBackward, onBringToFront, onSendToBack, onDeleteFeature }) {
  if (!selectedFeature) {
    return (
      <aside className="control-sidebar">
        <div className="control-content">
          <div className="control-empty">
            <MousePointerClick />
            <h4>No Feature Selected</h4>
            <p>Select a facial feature on the canvas to edit its properties.</p>
          </div>
        </div>
      </aside>
    )
  }

  const featureType = selectedFeature.featureType || 'feature'
  const x = Math.round(selectedFeature.left || 0)
  const y = Math.round(selectedFeature.top || 0)
  const width = Math.round((selectedFeature.width || 0) * (selectedFeature.scaleX || 1))
  const height = Math.round((selectedFeature.height || 0) * (selectedFeature.scaleY || 1))

  return (
    <aside className="control-sidebar">
      <div className="control-content">
        <div className="selected-feature-badge">
          <MousePointerClick />
          {featureType}
        </div>

        {/* Position */}
        <div className="control-section">
          <div className="control-section-title">Position</div>
          <div className="prop-row">
            <span className="prop-label">X:</span>
            <input className="prop-input" type="number" value={x} readOnly />
          </div>
          <div className="prop-row">
            <span className="prop-label">Y:</span>
            <input className="prop-input" type="number" value={y} readOnly />
          </div>
        </div>

        {/* Size */}
        <div className="control-section">
          <div className="control-section-title">Size</div>
          <div className="prop-row">
            <span className="prop-label">W:</span>
            <input className="prop-input" type="number" value={width} readOnly />
          </div>
          <div className="prop-row">
            <span className="prop-label">H:</span>
            <input className="prop-input" type="number" value={height} readOnly />
          </div>
        </div>

        {/* Resize buttons */}
        <div className="control-section">
          <div className="control-section-title">Scale</div>
          <div className="control-btn-grid">
            <button className="ctrl-btn" onClick={onBigger}>
              <Plus />
              Bigger
            </button>
            <button className="ctrl-btn" onClick={onSmaller}>
              <Minus />
              Smaller
            </button>
          </div>
        </div>

        {/* Layer management */}
        <div className="control-section">
          <div className="control-section-title">Layer Order</div>
          <div className="control-btn-grid">
            <button className="ctrl-btn" onClick={onBringForward}>
              <ArrowUp />
              Forward
            </button>
            <button className="ctrl-btn" onClick={onSendBackward}>
              <ArrowDown />
              Backward
            </button>
            <button className="ctrl-btn" onClick={onBringToFront}>
              <ChevronsUp />
              To Front
            </button>
            <button className="ctrl-btn" onClick={onSendToBack}>
              <ChevronsDown />
              To Back
            </button>
          </div>
        </div>

        {/* Delete */}
        <div className="control-section">
          <button className="ctrl-btn-full" onClick={onDeleteFeature}>
            <Trash2 />
            Delete Feature
          </button>
        </div>
      </div>
    </aside>
  )
}

export default FeatureControls
