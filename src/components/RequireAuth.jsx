// src/components/RequireAuth.jsx
import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../services/dbApi'

function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

export default RequireAuth
