import api from './api'

// GET /users/reward/ -> [{ id, title, description, points_threshold, reward_type, image }] (public)
export function fetchRewards(search = '') {
  const params = search ? { search } : {}
  return api.get('/users/reward/', { params })
}

// GET /users/MyReward/ -> [{ reward_details, reward_image, reward_description, unlocked_at }] (auth)
export function fetchMyRewards() {
  return api.get('/users/MyReward/')
}
