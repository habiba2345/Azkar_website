import api from './api'

// POST /racking/userprogress/ { adhkar: id } -> { adhkar, adhkar_title, points_earned, completed_at }
// Backend returns 400 with { detail: "..." } if the user already completed this dhikr today.
export function completeAdhkar(adhkarId) {
  return api.post('/racking/userprogress/', { adhkar: adhkarId })
}

// GET /racking/today-summary/ -> { completed_today, points_today }
export function fetchTodaySummary() {
  return api.get('/racking/today-summary/')
}

// GET /racking/notifications/ -> [{ id, title, is_enabled, reminder_time, sent_today }]
export function fetchNotifications() {
  return api.get('/racking/notifications/')
}

// title = النص اللي هيتبعت في الإيميل لما يجي وقت التذكير
export function createNotification({ title, is_enabled, reminder_time }) {
  return api.post('/racking/notifications/', { title, is_enabled, reminder_time })
}

export function updateNotification(id, { title, is_enabled, reminder_time }) {
  const payload = { is_enabled, reminder_time }
  if (title !== undefined) payload.title = title
  return api.patch(`/racking/notifications/${id}/`, payload)
}

export function deleteNotification(id) {
  return api.delete(`/racking/notifications/${id}/`)
}
