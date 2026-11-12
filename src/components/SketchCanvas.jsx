import { useRef, useEffect, useCallback } from 'react'
import * as fabric from 'fabric'
import { ImagePlus } from 'lucide-react'

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 600

function SketchCanvas({
  canvasRef,
  fabricRef,
  onSelectionChange,
  onObjectModified,
  onHistorySnapshot,
  onDropFeature,
}) {
  const containerRef = useRef(null)

  // Initialize Fabric.js canvas once
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    })

    fabricRef.current = fabricCanvas

    // Selection events
    fabricCanvas.on('selection:created', () => onSelectionChange(fabricCanvas))
    fabricCanvas.on('selection:updated', () => onSelectionChange(fabricCanvas))
    fabricCanvas.on('selection:cleared', () => onSelectionChange(fabricCanvas))

    // Object modified → update controls + history
    fabricCanvas.on('object:modified', () => {
      onSelectionChange(fabricCanvas)
      onObjectModified()
    })

    // Object moving → live update of controls
    fabricCanvas.on('object:moving', () => onSelectionChange(fabricCanvas))
    fabricCanvas.on('object:scaling', () => onSelectionChange(fabricCanvas))
    fabricCanvas.on('object:rotating', () => onSelectionChange(fabricCanvas))

    // Initial history snapshot
    onHistorySnapshot()

    return () => {
      fabricCanvas.dispose()
      fabricRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mouse wheel zoom
  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    function handleWheel(e) {
      if (!e.ctrlKey) return
      e.preventDefault()
    }

    canvasEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvasEl.removeEventListener('wheel', handleWheel)
  }, [])

  // Drag and drop onto canvas
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      const featureType = e.dataTransfer.getData('featureType')
      const featureFilename = e.dataTransfer.getData('featureFilename')
      const featureUrl = e.dataTransfer.getData('featureUrl')
      if (featureType && featureFilename) {
        onDropFeature(featureType, featureFilename, featureUrl, e)
      }
    },
    [onDropFeature]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  return (
    <div
      className="canvas-area"
      ref={containerRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
      </div>
    </div>
  )
}

export default SketchCanvas
