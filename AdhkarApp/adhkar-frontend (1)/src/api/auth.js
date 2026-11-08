import api from './api'

// Register a new user via Djoser (djoser.serializers.UserCreateSerializer)
// Requires re_password because DJOSER.USER_CREATE_PASSWORD_RETYPE is enabled on the backend
export function registerUser({ username, email, password, re_password }) {
  return api.post('/auth/users/', { username, email, password, re_password })
}

// Log in via SimpleJWT (through Djoser's jwt urls) -> { access, refresh }
export function loginUser({ username, password }) {
  return api.post('/auth/jwt/create/', { username, password })
}

export function refreshToken(refresh) {
  return api.post('/auth/jwt/refresh/', { refresh })
}

// Custom profile endpoint from the `users` app (includes total_points, unlike Djoser's /auth/users/me/)
export function fetchProfile() {
  return api.get('/users/userprofile/')
}
