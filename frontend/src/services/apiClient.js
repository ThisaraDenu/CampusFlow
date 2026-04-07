const TOKEN_KEY = 'campusflow_token'

export function getApiBase() {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:8081'
  return base.replace(/\/$/, '')
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options
  const url = path.startsWith('http')
    ? path
    : `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`
  const h = { ...headers }
  if (!skipAuth) {
    const t = getToken()
    if (t) {
      h.Authorization = `Bearer ${t}`
    }
  }
  let finalBody
  if (body instanceof FormData) {
    finalBody = body
  } else if (body != null && typeof body === 'object') {
    h['Content-Type'] = 'application/json'
    finalBody = JSON.stringify(body)
  } else {
    finalBody = body
  }
  return fetch(url, { method, headers: h, body: finalBody })
}

export async function apiRequest(path, options = {}) {
  const res = await apiFetch(path, options)
  if (res.status === 204) {
    return null
  }
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { error: text || res.statusText }
  }
  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) || res.statusText || 'Request failed'
    throw new Error(typeof msg === 'string' ? msg : 'Request failed')
  }
  return data
}

export function attachmentRawUrl(attachmentId) {
  return `${getApiBase()}/api/ticket-attachments/${attachmentId}/raw`
}

export async function fetchAttachmentBlobUrl(attachmentId) {
  const res = await apiFetch(`/api/ticket-attachments/${attachmentId}/raw`)
  if (!res.ok) {
    throw new Error('Failed to load attachment')
  }
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
