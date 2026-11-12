// Utility for saving and retrieving sketch history from localStorage.
// This lets the Saved Cases page show all previously saved sketches
// without needing a real database.

import { demoSketches } from '../data/mockData'

const STORAGE_KEY = 'forensiq_saved_sketches'

// Read all saved sketches from localStorage.
// If none exist yet, seed with demo sketches on first call.
export function getSavedSketches() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    // First visit: seed demo sketches
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoSketches))
    return demoSketches
  }
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

// Add a new sketch to the history. Never overwrites existing sketches.
export function addSketch(sketch) {
  const sketches = getSavedSketches()
  sketches.push(sketch)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sketches))
  return sketches
}

// Delete a single sketch by its ID.
export function deleteSketch(id) {
  const sketches = getSavedSketches()
  const filtered = sketches.filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return filtered
}

// Generate the next sketch ID (SKETCH-001, SKETCH-002, ...).
export function nextSketchId() {
  const sketches = getSavedSketches()
  let max = 0
  for (const s of sketches) {
    const num = parseInt(s.id?.replace('SKETCH-', ''), 10)
    if (!isNaN(num) && num > max) max = num
  }
  return `SKETCH-${String(max + 1).padStart(3, '0')}`
}

// Format a Date into "23 Sep 2026 • 11:45 AM" style string.
export function formatDate(d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const day = d.getDate()
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${day} ${month} ${year} • ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}
