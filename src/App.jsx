
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import GenerateSketch from './pages/GenerateSketch'
import SavedCases from './pages/SavedCases'
import CriminalDatabase from './pages/CriminalDatabase'
import CriminalProfile from './pages/CriminalProfile'
import AIAnalysis from './pages/AIAnalysis'
import NLPSuspectIdentification from './pages/NLPSuspectIdentification'
import CaseDetails from './pages/CaseDetails'
import { Settings } from './pages/PlaceholderPages'
import './styles/global.css'
import './styles/dashboard.css'
import './styles/savedCases.css'
import './styles/criminalDatabase.css'
import './styles/criminalProfile.css'
import './styles/aiAnalysis.css'
import './styles/assistant.css'
import './styles/responsive.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sketch-generation" element={<GenerateSketch />} />
          <Route path="/criminal-database" element={<CriminalDatabase />} />
          <Route path="/saved-cases" element={<SavedCases />} />
          <Route path="/case-details/:id" element={<CaseDetails />} />
          <Route path="/criminal-profile/:id" element={<CriminalProfile />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/nlp-identification" element={<NLPSuspectIdentification />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
