
 // src/services/dbApi.js
// All calls to the Flask backend (database module) go through here.

export const API_BASE = 'http://127.0.0.1:5000'

const TOKEN_KEY = 'forensiq_token'
const ROLE_KEY = 'forensiq_role'
const USER_KEY = 'forensiq_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getRole = () => localStorage.getItem(ROLE_KEY)
export const getUsername = () => localStorage.getItem(USER_KEY)
export const isLoggedIn = () => !!getToken()

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_KEY)
}

// Turns "/api/uploads/x.jpg" into a full URL usable in <img src>
export const imageSrc = (url) => (url ? `${API_BASE}${url}` : '')

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()

  if (token) headers.Authorization = `Bearer ${token}`

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  let res

  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new Error('Cannot reach the backend. Is "python app.py" running?')
  }

  let data = null

  try {
    data = await res.json()
  } catch {
    /* response had no JSON body */
  }

  // Expired or invalid token: send the user back to login
  if ((res.status === 401 || res.status === 422) && token && path !== '/api/auth/login') {
    logout()
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.msg || `Request failed (${res.status})`)
  }

  return data
}

// ---- Authentication ----

export async function login(username, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(ROLE_KEY, data.role)
  localStorage.setItem(USER_KEY, data.username)

  return data
}

// ---- Criminal Database: Profiles ----

export function listProfiles(params = {}) {
  const qs = new URLSearchParams()

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'All') {
      qs.append(k, v)
    }
  })

  return request(`/api/profiles?${qs.toString()}`)
}

export const getProfile = (id) => request(`/api/profiles/${id}`)

export const createProfile = (body) =>
  request('/api/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const updateProfile = (id, body) =>
  request(`/api/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

export const archiveProfile = (id) =>
  request(`/api/profiles/${id}`, { method: 'DELETE' })

export function uploadImage(id, file, imageType = 'additional') {
  const form = new FormData()

  form.append('image', file)
  form.append('image_type', imageType)

  return request(`/api/profiles/${id}/images`, {
    method: 'POST',
    body: form,
  })
}

// ---- Cases ----

export const listCases = () => request('/api/cases')

export const getCase = (id) => request(`/api/cases/${id}`)

export const createCase = (body) =>
  request('/api/cases', {
    method: 'POST',
    body: JSON.stringify(body),
  })

export const updateCase = (id, body) =>
  request(`/api/cases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })

export const linkProfile = (caseId, profileId) =>
  request(`/api/cases/${caseId}/profiles`, {
    method: 'POST',
    body: JSON.stringify({ profile_id: profileId }),
  })

export const unlinkProfile = (caseId, profileId) =>
  request(`/api/cases/${caseId}/profiles/${profileId}`, {
    method: 'DELETE',
  })

// ---- NLP Suspect Identification ----

export const searchSuspects = (description) =>
  request('/api/nlp/search', {
    method: 'POST',
    body: JSON.stringify({ description }),
  })
