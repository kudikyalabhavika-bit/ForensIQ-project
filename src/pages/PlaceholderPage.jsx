import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'

function PlaceholderPage({ title, description }) {
  const navigate = useNavigate()

  return (
    <div className="placeholder-page fi-fade-in">
      <div className="placeholder-card glass-panel">
        <div className="placeholder-icon">
          <Construction />
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <button className="placeholder-back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default PlaceholderPage
