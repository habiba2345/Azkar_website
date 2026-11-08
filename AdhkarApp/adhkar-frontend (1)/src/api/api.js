import axios from 'axios'

// Base URL of the Django backend, configured via VITE_API_URL (see .env.example)
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const ACCESS_KEY = 'adhkar_access_token'
const REFRESH_KEY = 'adhkar_refresh_token'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_KEY, access)
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}

const api = axios.create({
  baseURL: API_URL,
})

// Attach the access token to every request when available
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Helper (kept outside axios instance to avoid circular import loops)
let isRefreshing = false
let pendingQueue = []

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingQueue = []
}

// On a 401, try to refresh the access token once, then retry the request.
// If refresh also fails, clear tokens so the app can redirect to login.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/jwt/')

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = tokenStorage.getRefresh()
      if (!refreshToken) {
        tokenStorage.clear()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
          refresh: refreshToken,
        })
        tokenStorage.setTokens(data.access, null)
        resolveQueue(null, data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return api(originalRequest)
      } catch (refreshError) {
        resolveQueue(refreshError, null)
        tokenStorage.clear()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Extracts a friendly, user-facing message from a DRF/Djoser error response
export function getErrorMessage(error, fallback = 'حدث خطأ غير متوقع. حاول مرة أخرى.') {
  if (!error?.response) {
    return 'تعذر الاتصال بالخادم. تأكد من اتصالك بالإنترنت.'
  }
  const data = error.response.data
  if (!data) return fallback

  if (typeof data === 'string') return data

  // DRF's ValidationError, when raised with a plain string (e.g. the
  // "already completed today" error in racking/views.py), is serialized as
  // a bare JSON array ["message"] rather than {"detail": "message"}.
  if (Array.isArray(data)) {
    const first = data[0]
    return typeof first === 'string' ? first : fallback
  }

  if (data.detail) {
    return Array.isArray(data.detail) ? data.detail[0] : data.detail
  }

  // Djoser/DRF field errors: { field: ["message"] } or { field: "message" }
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const value = data[firstKey]
    const message = Array.isArray(value) ? value[0] : value
    if (typeof message === 'string') {
      return firstKey === 'non_field_errors' ? message : `${firstKey}: ${message}`
    }
  }
  return fallback
}

// The backend can return relative media URLs (e.g. "/media/rewards_images/x.png")
// in some deployment setups. Resolve them against the API host so <img> tags
// don't accidentally request them from the frontend's own origin.
export function resolveMediaUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export default api
