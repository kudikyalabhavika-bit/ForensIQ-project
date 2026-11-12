import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fingerprint, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'
import { login } from '../services/dbApi'
import '../styles/login.css'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    try {
      // Real login against the Flask backend (JWT token + role)
      await login(username.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Animated forensic background */}
      <div className="login-bg">
        <div className="login-bg-grid" />
        <div className="login-bg-scan" />
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Fingerprint />
          </div>
          <h1>ForensIQ</h1>
          <p>AI-Powered Forensic Investigation</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Username / Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="username">
              Email / Username
            </label>
            <div className="field-input-wrapper">
              <span className="field-input-icon">
                <Mail />
              </span>
              <input
                id="username"
                className="field-input"
                type="text"
                placeholder="Enter your email or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="field-input-wrapper">
              <span className="field-input-icon">
                <Lock />
              </span>
              <input
                id="password"
                className="field-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="field-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="login-options">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              className="forgot-link"
              onClick={() => setError('Password recovery is not available in this prototype.')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="fi-spinner" />
            ) : (
              <>
                <ShieldCheck />
                <span>Secure Login</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <ShieldCheck size={12} />
          <span> Secure Prototype Access</span>
          <br />
          <span className="dot">•</span>
          ForensIQ v1.0
          <span className="dot">•</span>
          Authorized Personnel Only
        </div>
      </div>
    </div>
  )
}

export default Login
